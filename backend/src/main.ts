import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Serve frontend static files
  const frontendPaths = [
    join(__dirname, '..', '..', 'frontend', 'out'),
    join(__dirname, '..', '..', 'frontend', '.next', 'standalone', 'frontend'),
  ];

  let frontendPath: string | null = null;
  for (const p of frontendPaths) {
    if (existsSync(p)) {
      frontendPath = p;
      break;
    }
  }

  if (frontendPath) {
    const express = require('express');
    app.use('/', express.static(frontendPath, {
      index: false,
      extensions: ['html'],
    }));

    app.use('/*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/_next')) {
        return next();
      }
      const indexPath = join(frontendPath, 'index.html');
      const pathHtml = join(frontendPath, req.path.replace(/\/$/, ''), 'index.html');
      const altPath = join(frontendPath, req.path.replace(/\/$/, '') + '.html');

      if (existsSync(pathHtml)) {
        res.sendFile(pathHtml);
      } else if (existsSync(altPath)) {
        res.sendFile(altPath);
      } else if (existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Pagina nao encontrada');
      }
    });

    console.log(`Servindo frontend de: ${frontendPath}`);
  } else {
    console.log('Modo API apenas (frontend nao encontrado)');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`BarberFlow Pro rodando em http://localhost:${port}`);
}
bootstrap();
