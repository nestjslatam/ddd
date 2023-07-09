import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000, () =>
    console.log('Listening at http://localhost:3000'),
  );
}
bootstrap();
