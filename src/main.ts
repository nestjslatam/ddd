import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { BadRequestException } from '@nestjs/common/exceptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    //NOTE: How to generate custom error message object. Using exception factory
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(result);
      },
      stopAtFirstError: true,
    }),
  );

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('DDD Overview NESTJS API')
    .setDescription('This a sample using @nestjslatam/ddd')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, () =>
    console.log(`Listening at http://localhost:${PORT}`),
  );
}
bootstrap();
