import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.js';
import { clientsRouter } from './routes/clients.js';
import { invoicesRouter } from './routes/invoices.js';
import { profileRouter } from './routes/profile.js';
import { getErrorMessage, HttpError } from './lib/http.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/invoices', invoicesRouter);

  app.use((_request, _response, next) => {
    next(new HttpError(404, 'Route not found'));
  });

  app.use((error: unknown, _request: Request, response: Response, _next: () => void) => {
    const status = error instanceof HttpError
      ? error.status
      : error instanceof ZodError
        ? 400
        : 500;

    response.status(status).json({
      message: getErrorMessage(error),
    });
  });

  return app;
}
