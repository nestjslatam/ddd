import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(3000, () =>
    console.log('Listening at http://localhost:3000'),
  );
}
bootstrap();
