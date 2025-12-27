import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(private prisma: PrismaService) {}

  @Get('db')
  @ApiOperation({ summary: 'Test database connection' })
  async testDb() {
    try {
      const userCount = await this.prisma.user.count();
      return {
        success: true,
        message: 'Database connected successfully',
        userCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('register-simple')
  @ApiOperation({ summary: 'Simple registration test (no validation)' })
  async testRegister(@Body() body: any) {
    try {
      const { email, password, name, handle } = body;

      // Check if user exists
      const existing = await this.prisma.user.findFirst({
        where: {
          OR: [{ email }, { handle }],
        },
      });

      if (existing) {
        return {
          success: false,
          message: 'User already exists',
          existing: { email: existing.email, handle: existing.handle }
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          handle,
          passwordHash,
          credibilityScore: 50.0,
          dailyPoints: 100,
        },
      });

      return {
        success: true,
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          handle: user.handle,
          credibilityScore: user.credibilityScore,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (test)' })
  async listUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
          credibilityScore: true,
          createdAt: true,
        },
        take: 10,
      });

      return {
        success: true,
        count: users.length,
        users,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}