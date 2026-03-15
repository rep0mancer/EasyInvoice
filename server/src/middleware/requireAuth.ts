import { NextFunction, Request, Response } from 'express';
import { authCookieName, readAuthCookie } from '../lib/auth.js';
import { HttpError } from '../lib/http.js';

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.cookies?.[authCookieName];
    const payload = readAuthCookie(token);

    if (!payload) {
      throw new HttpError(401, 'Authentication required');
    }

    request.auth = { userId: payload.userId };
    next();
  } catch {
    next(new HttpError(401, 'Authentication required'));
  }
}
