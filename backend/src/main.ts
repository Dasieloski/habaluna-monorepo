import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  // CORS - Configuración flexible para producción
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // En desarrollo, permitir cualquier origen localhost
      if (process.env.NODE_ENV !== 'production') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      // Normalizar URLs (sin trailing slash)
      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedFrontendUrl = frontendUrl.replace(/\/$/, '');
      
      // Verificar coincidencia exacta
      if (normalizedOrigin === normalizedFrontendUrl) {
        return callback(null, true);
      }
      
      // Permitir dominios de Railway (para desarrollo/testing)
      if (normalizedOrigin.includes('.railway.app')) {
        return callback(null, true);
      }
      
      // Log para debugging
      console.log(`⚠️ CORS: Origen bloqueado: ${origin}`);
      console.log(`✅ Origen esperado: ${normalizedFrontendUrl}`);
      callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Permitir campos adicionales para multipart/form-data
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
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
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
