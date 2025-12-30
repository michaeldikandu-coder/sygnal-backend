import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URLS || 'https://yourdomain.com').split(',')
    : [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5173', // Vite default
        'http://localhost:4200', // Angular default
        'http://localhost:8080', // Vue default
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
  });

  // Security headers
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Sygnal API')
    .setDescription('Reputation & Prediction Market Social Network API - A comprehensive platform for creating and participating in prediction markets with real-world event integration.')
    .setVersion('1.0.0')
    .setContact('Sygnal Team', 'https://sygnal.ai', 'support@sygnal.ai')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.sygnal.ai', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management, profiles, and social features')
    .addTag('Signals', 'Core prediction signals and content management')
    .addTag('Interactions', 'Convictions (votes) and comments on signals')
    .addTag('Challenges', 'Prediction duels and stake-based challenges')
    .addTag('Trending', 'Trending content and discovery algorithms')
    .addTag('Analytics', 'Performance metrics and accuracy tracking')
    .addTag('Notifications', 'Real-time user notifications')
    .addTag('Search', 'Full-text search across signals, users, and topics')
    .addTag('Feeds', 'Real-world event feeds and auto-generated signals')
    .addTag('Categories', 'Content categories and trending topics')
    .addTag('Credibility', 'Credibility scoring and reputation system')
    .addTag('Achievements', 'Gamification system and user achievements')
    .addTag('Polymarket', 'Polymarket prediction markets integration')
    .addTag('Health', 'System health checks and monitoring')
    .addTag('Test', 'Development and testing endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Sygnal API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  await app.listen(port);
  console.log(`🚀 Sygnal Backend running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
  console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 API available at: http://localhost:${port}/api`);
}

bootstrap();