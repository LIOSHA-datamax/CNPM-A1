import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho phép Next.js frontend truy cập
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix: /api
  app.setGlobalPrefix('api');

  // Global validation pipe
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

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`\n======================================================`);
  console.log(`🚀 BrewLite Backend API đang chạy tại: http://localhost:${port}/api`);
  console.log(`📚 Swagger API Docs (Kiểm thử trực quan): http://localhost:${port}/api/docs`);
  console.log(`======================================================\n`);
}

bootstrap();
