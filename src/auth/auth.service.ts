import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, refreshToken, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, handle } = registerDto;

    try {
      // Check if user already exists with retry logic
      const existingUser = await this.findExistingUserWithRetry(email, handle);

      if (existingUser) {
        throw new ConflictException('User with this email or handle already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with transaction to ensure stats are seeded
      const user = await this.createUserWithRetry({
        email,
        name,
        handle,
        passwordHash: hashedPassword,
      });

      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      const { passwordHash: _, refreshToken: __, ...userResult } = user;
      return {
        user: userResult,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error('Registration failed:', error.message);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  private async findExistingUserWithRetry(email: string, handle: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.prisma.user.findFirst({
          where: {
            OR: [{ email }, { handle }],
          },
        });
      } catch (error) {
        this.logger.warn(`Database query attempt ${i + 1} failed:`, error.message);
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  private async createUserWithRetry(userData: any, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              ...userData,
              credibilityScore: 50.0,
              dailyPoints: 100,
              accuracy: 0.0,
              accountAge: 0,
              streak: 0,
            },
          });

          // Create initial credibility history entry
          await tx.credibilityHistory.create({
            data: {
              userId: newUser.id,
              score: 50.0,
              change: 50.0,
              reason: 'Account creation',
            },
          });

          return newUser;
        });
      } catch (error) {
        this.logger.warn(`User creation attempt ${i + 1} failed:`, error.message);
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  async login(user: any) {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // In a real app, you'd send an email with a reset token
    // For now, we'll just return a success message
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    // In a real app, you'd validate the reset token
    // For now, we'll just return an error
    throw new BadRequestException('Invalid or expired reset token');
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatar: true,
        verified: true,
        credibilityScore: true,
        accuracy: true,
        accountAge: true,
        dailyPoints: true,
        streak: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            followers: true,
            following: true,
            signals: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}