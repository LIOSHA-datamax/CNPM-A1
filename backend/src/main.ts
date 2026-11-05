import { existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
if (typeof process.loadEnvFile === 'function' && existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

// Giá trị mặc định chuẩn Docker nếu người dùng mới clone về chưa tạo .env
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/brewlite?schema=public';
process.env.PORT = process.env.PORT || '4000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'brewlite_jwt_secret_dev_2026';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép gọi cả route có tiền tố /api và không có /api (ngoại trừ /api/docs của Swagger)
  app.use((req: any, _res: any, next: any) => {
    if (req.url && req.url.startsWith('/api/') && !req.url.startsWith('/api/docs')) {
      req.url = req.url.replace(/^\/api/, '');
    }
    next();
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Cấu hình Swagger API Docs
  const config = new DocumentBuilder()
    .setTitle('BrewLite API')
    .setDescription('Tài liệu REST API cho đồ án môn CNPM - Ứng dụng đặt cà phê và thanh toán không tiền mặt')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`\n======================================================`);
  console.log(`BrewLite Backend API đang chạy tại: http://localhost:${port}`);
  console.log(`Swagger API Docs: http://localhost:${port}/api/docs`);
  console.log(`======================================================\n`);
}

bootstrap();
