import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { ensureSrvDns } from './database/dns-fallback';

async function bootstrap(): Promise<void> {
  await ensureSrvDns();
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  // Browsers send an Origin with no path and no trailing slash
  // ("https://app.example.com"), so normalise whatever is configured to that
  // shape. A stray trailing slash in FRONTEND_URL used to silently block every
  // cross-origin request.
  const normaliseOrigin = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      return new URL(trimmed).origin;
    } catch {
      return trimmed.replace(/\/+$/, '');
    }
  };

  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map(normaliseOrigin)
    .filter(Boolean);

  logger.log(`CORS allow-list: ${frontendUrls.join(', ') || '(none)'} + any localhost`);

  app.enableCors({
    // Allow the configured frontend(s); also reflect any localhost origin for local dev.
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const candidate = normaliseOrigin(origin);
      if (frontendUrls.includes(candidate) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(candidate)) {
        return cb(null, true);
      }
      logger.warn(`Blocked CORS request from origin: ${origin}`);
      return cb(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.enableShutdownHooks();

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);

  const db = app.get(DatabaseService);
  logger.log(`CRE8R API listening on http://localhost:${port}/api (storage: ${db.mode})`);
  if (!process.env.JWT_SECRET) logger.warn('JWT_SECRET not set — using insecure development secret');
}

bootstrap();
