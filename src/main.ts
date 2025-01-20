import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './shared/seed/Admin-seeder.service';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './shared/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      dismissDefaultMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');
  const adminSeeder = app.get(SeederService);
  await adminSeeder.createAdmin();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
