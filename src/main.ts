import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🤖 Bot iniciado na porta ${port}`);
}

bootstrap().catch(err => {
  console.error('❌ Erro ao iniciar bot:', err);
  process.exit(1);
});
