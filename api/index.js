const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { ValidationPipe } = require('@nestjs/common');
const express = require('express');
const path = require('path');
const fs = require('fs');

let cachedApp;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const server = express();
  const { AppModule } = require(path.join(__dirname, '..', 'backend', 'dist', 'app.module'));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.init();
  cachedApp = server;
  return cachedApp;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
