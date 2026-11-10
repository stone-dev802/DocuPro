import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('DocuProBootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const webUrl = configService.get<string>('WEB_URL', 'http://localhost:5173');

  // Parser de cookies sécurisés
  app.use(cookieParser());

  // Configuration CORS stricte (credentials pour cookies HttpOnly)
  app.enableCors({
    origin: webUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Tenant-Id'],
  });

  await app.listen(port);
  logger.log(`🚀 DocuPro API initialisée avec succès sur http://localhost:${port}`);
  logger.log(`🔒 Driver Antivirus actif : ${configService.get<string>('ANTIVIRUS_DRIVER')}`);
}

bootstrap();
