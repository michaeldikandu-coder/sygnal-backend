import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Check API and database connectivity'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-15T10:30:00Z',
        database: 'connected'
      }
    }
  })
  async healthCheck() {
    try {
      // Test database connection with a simple MongoDB query
      await this.prisma.user.findFirst();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0'
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      };
    }
  }

  @Get('db')
  @ApiOperation({ 
    summary: 'Database health check',
    description: 'Test database connectivity and performance'
  })
  async databaseHealth() {
    try {
      const start = Date.now();
      
      // Test basic query
      const userCount = await this.prisma.user.count();
      const signalCount = await this.prisma.signal.count();
      
      const responseTime = Date.now() - start;
      
      return {
        status: 'ok',
        responseTime: `${responseTime}ms`,
        collections: {
          users: userCount,
          signals: signalCount
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}