import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { redisStore } from 'cache-manager-redis-yet';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SignalsModule } from './signals/signals.module';
import { InteractionsModule } from './interactions/interactions.module';
import { ChallengesModule } from './challenges/challenges.module';
import { ThesisModule } from './thesis/thesis.module';
import { TrendingModule } from './trending/trending.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { AchievementsModule } from './achievements/achievements.module';
import { DiscoverModule } from './discover/discover.module';
import { CategoriesModule } from './categories/categories.module';
import { CredibilityModule } from './credibility/credibility.module';
import { FeedsModule } from './feeds/feeds.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { HealthModule } from './health/health.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL) || 60,
      limit: parseInt(process.env.THROTTLE_LIMIT) || 10,
    }]),
    
    // Redis Cache (commented out for now - uncomment when Redis is available)
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore,
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: parseInt(process.env.REDIS_PORT) || 6379,
    //   password: process.env.REDIS_PASSWORD,
    //   ttl: parseInt(process.env.CACHE_TTL) || 300,
    // }),
    
    // Bull Queue (commented out for now - uncomment when Redis is available)
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.BULL_REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.BULL_REDIS_PORT) || 6379,
    //   },
    // }),
    
    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    SignalsModule,
    InteractionsModule,
    ChallengesModule,
    ThesisModule,
    TrendingModule,
    AnalyticsModule,
    NotificationsModule,
    SearchModule,
    AchievementsModule,
    DiscoverModule,
    CategoriesModule,
    CredibilityModule,
    FeedsModule,
    SchedulerModule,
    HealthModule,
    TestModule,
  ],
})
export class AppModule {}