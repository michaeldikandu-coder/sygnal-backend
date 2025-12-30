import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'minimal',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      // Set connection timeout for production
      await this.$connect();
      this.logger.log('✅ Connected to PostgreSQL database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to PostgreSQL database:', error.message);
      
      // In production, don't crash the app - let it retry
      if (process.env.NODE_ENV === 'production') {
        this.logger.warn('🔄 Database connection failed, app will continue with limited functionality');
        return;
      }
      
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Disconnected from PostgreSQL database');
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'production') return;
    
    const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');
    
    return Promise.all(
      models.map((modelKey) => this[modelKey].deleteMany())
    );
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.user.findFirst();
      return true;
    } catch (error) {
      this.logger.warn('Database health check failed:', error.message);
      return false;
    }
  }
}