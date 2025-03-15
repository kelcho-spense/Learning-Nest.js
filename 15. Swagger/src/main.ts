import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Book Vault API')
    .setDescription('The Book Vault API description')
    .setVersion('1.0')
    .addTag('Books').build();

    const documentFactory = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory,{ // http.domain.com/api that will be used to generate the Swagger UI
      jsonDocumentUrl: 'api/swagger/json', // http.domain.com/api/swagger/json that will be used to generate the JSON file
    });

  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow('PORT') ?? 3000);
}
bootstrap();
