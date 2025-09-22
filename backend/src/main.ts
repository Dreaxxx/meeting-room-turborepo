import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
// import { PrismaExceptionFilter } from './prisma/prisma-exception/prisma-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // app.useGlobalFilters(new PrismaExceptionFilter());

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Nest bootstrap failed:', err);
  process.exit(1);
});
