import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as crypto from 'crypto';

// Asegurar que crypto esté disponible globalmente para @nestjs/schedule
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = crypto;
}

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Usar Winston como logger global
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const logger = new Logger('Bootstrap');

  // CORS DEBE IR PRIMERO - Antes de cualquier otro middleware
  // CORS - Configuración flexible para producción
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';

  // Función para normalizar dominio (extraer dominio base sin www)
  const getBaseDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/^www\./, ''); // Remover www
      return hostname;
    } catch {
      return url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
    }
  };

  // Construir lista de orígenes permitidos
  const allowedOriginsList: string[] = [];
  if (frontendUrl) {
    allowedOriginsList.push(frontendUrl);
  }
  if (allowedOriginsEnv) {
    allowedOriginsList.push(...allowedOriginsEnv.split(',').map((o) => o.trim()));
  }

  logger.log(
    `CORS configurado. Orígenes permitidos: ${JSON.stringify(allowedOriginsList)}`,
    'Bootstrap',
  );
  logger.log(`CORS - NODE_ENV: ${process.env.NODE_ENV}, FRONTEND_URL: ${frontendUrl}`, 'Bootstrap');

  // IMPORTANTE: Responder preflight (OPTIONS) ANTES del middleware cors().
  // Si cors() rechaza un origin, Express salta a error-handlers y los middlewares normales no se ejecutan.
  // Poniéndolo primero garantizamos headers CORS en preflight para orígenes esperados.
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin as string | undefined;
      if (origin) {
        const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
        const originDomain = getBaseDomain(normalizedOrigin);
        const normalizedAllowed = allowedOriginsList.map((o) => o.replace(/\/$/, '').toLowerCase());

        const isAllowed =
          normalizedAllowed.includes(normalizedOrigin) ||
          // mismo dominio base (con/sin www)
          normalizedAllowed.some((o) => getBaseDomain(o) === originDomain) ||
          // dominios del proyecto
          originDomain === 'habaluna.com' ||
          originDomain.endsWith('.habaluna.com') ||
          originDomain === 'habanaluna.com' ||
          originDomain.endsWith('.habanaluna.com') ||
          // hosts de plataformas
          normalizedOrigin.includes('.vercel.app') ||
          normalizedOrigin.includes('.railway.app') ||
          // desarrollo
          (process.env.NODE_ENV !== 'production' &&
            (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')));

        if (isAllowed) {
          res.header('Vary', 'Origin');
          res.header('Access-Control-Allow-Origin', origin);
          res.header('Access-Control-Allow-Credentials', 'true');
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
          res.header(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, X-CSRF-Token',
          );
          res.header('Access-Control-Max-Age', '86400');
          return res.status(204).end();
        }
      }
    }
    next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      // Log para debugging (usar log en lugar de debug para que se vea en producción)
      logger.log(`CORS: Request recibido, origin: ${origin || 'null'}`, 'CORS');

      // Permitir requests sin origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        logger.log('CORS: Request sin origin permitido', 'CORS');
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
      logger.log(`CORS: normalizedOrigin=${normalizedOrigin}`, 'CORS');

      // En desarrollo, permitir cualquier origen localhost
      if (process.env.NODE_ENV !== 'production') {
        if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
          logger.log(`CORS: Origen localhost permitido: ${origin}`, 'CORS');
          return callback(null, true);
        }
      }

      // Verificar coincidencia exacta con orígenes permitidos
      const normalizedAllowed = allowedOriginsList.map((o) => o.replace(/\/$/, '').toLowerCase());
      if (normalizedAllowed.includes(normalizedOrigin)) {
        logger.log(`CORS: Origen permitido (exacto): ${origin}`, 'CORS');
        return callback(null, true);
      }

      // Verificar si es el mismo dominio base (con/sin www)
      const originDomain = getBaseDomain(normalizedOrigin);
      for (const allowedOrigin of normalizedAllowed) {
        const allowedDomain = getBaseDomain(allowedOrigin);
        if (originDomain === allowedDomain) {
          logger.log(`CORS: Origen permitido (mismo dominio): ${origin} (${originDomain})`, 'CORS');
          return callback(null, true);
        }
      }

      // Permitir dominios custom del proyecto (si el frontend está en habaluna.com / habanaluna.com)
      // Esto evita que el deploy quede bloqueado por CORS si FRONTEND_URL no está seteado correctamente.
      if (originDomain === 'habaluna.com' || originDomain.endsWith('.habaluna.com')) {
        logger.log(`CORS: Origen permitido (dominio habaluna): ${origin}`, 'CORS');
        return callback(null, true);
      }
      if (originDomain === 'habanaluna.com' || originDomain.endsWith('.habanaluna.com')) {
        logger.log(`CORS: Origen permitido (dominio habanaluna): ${origin}`, 'CORS');
        return callback(null, true);
      }

      // Permitir dominios de Railway (para desarrollo/testing)
      if (normalizedOrigin.includes('.railway.app')) {
        logger.log(`CORS: Origen Railway permitido: ${origin}`, 'CORS');
        return callback(null, true);
      }

      // Permitir dominios de Vercel (para frontend en producción)
      // Verificar múltiples variantes para asegurar que funcione
      if (
        normalizedOrigin.includes('.vercel.app') ||
        normalizedOrigin.includes('vercel.app') ||
        normalizedOrigin.endsWith('vercel.app')
      ) {
        logger.log(`CORS: Origen Vercel permitido: ${origin}`, 'CORS');
        return callback(null, true);
      }

      // TEMPORAL: En producción, permitir cualquier origen que contenga 'vercel' para debugging
      // TODO: Remover después de verificar que funciona
      if (process.env.NODE_ENV === 'production' && normalizedOrigin.includes('vercel')) {
        logger.warn(`CORS: Origen Vercel permitido (modo debug): ${origin}`, 'CORS');
        return callback(null, true);
      }

      // Log para debugging
      logger.warn(`CORS: Origen bloqueado: ${origin}`, 'CORS');
      logger.warn(
        `CORS Debug: normalizedOrigin=${normalizedOrigin}, allowedOrigins=${JSON.stringify(normalizedAllowed)}, NODE_ENV=${process.env.NODE_ENV}`,
        'CORS',
      );
      callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-CSRF-Token',
    ],
    // Importante: permitir que el cliente lea los headers de rate limiting
    exposedHeaders: [
      'Authorization',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],
    maxAge: 86400, // 24 horas
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // IMPORTANTE: Manejar OPTIONS requests manualmente si es necesario
  // Esto asegura que el preflight request siempre pase
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;
      if (origin) {
        const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
        const originDomain = getBaseDomain(normalizedOrigin);
        // Permitir cualquier origen de Vercel o Railway en producción
        if (
          normalizedOrigin.includes('.vercel.app') ||
          normalizedOrigin.includes('vercel.app') ||
          normalizedOrigin.includes('.railway.app') ||
          originDomain === 'habaluna.com' ||
          originDomain.endsWith('.habaluna.com') ||
          originDomain === 'habanaluna.com' ||
          originDomain.endsWith('.habanaluna.com')
        ) {
          res.header('Access-Control-Allow-Origin', origin);
          res.header('Access-Control-Allow-Credentials', 'true');
          res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
          );
          res.header(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, X-CSRF-Token',
          );
          res.header('Access-Control-Max-Age', '86400');
          return res.status(204).end();
        }
      }
    }
    next();
  });

  // Helmet - Headers de seguridad HTTP (después de CORS)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          connectSrc: [
            "'self'",
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'https://*.vercel.app',
            'https://*.railway.app',
          ],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Deshabilitado para permitir Swagger y otros recursos
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite recursos desde diferentes orígenes
    }),
  );

  // Servir archivos estáticos
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  // Compatibilidad: servir también directamente desde la raíz para rutas antiguas
  // Ej: /banners/banner-1.jpg, /products/xxx.jpg -> uploads/banners/banner-1.jpg, uploads/products/xxx.jpg
  app.useStaticAssets(uploadsPath);

  // Con proxies (Railway / reverse proxy), Express debe confiar en X-Forwarded-For
  if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Cookie Parser - Necesario para CSRF protection
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix('api');

  // Global Exception Filter - Debe ir antes de otros middlewares
  // Usar el contenedor de DI para que el filtro pueda inyectar dependencias
  const httpExceptionFilter = app.get(HttpExceptionFilter);
  app.useGlobalFilters(httpExceptionFilter);

  // Validation y Sanitización
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Permitir campos adicionales para multipart/form-data
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Sanitización automática de inputs
      // Esto limpia automáticamente strings de HTML, scripts, etc.
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Habanaluna API')
    .setDescription('API para ecommerce premium de productos de alimentación')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Server running on 0.0.0.0:${port}`, 'Bootstrap');
  logger.log(`📚 Swagger docs available at /api/docs`, 'Bootstrap');
}

bootstrap();
