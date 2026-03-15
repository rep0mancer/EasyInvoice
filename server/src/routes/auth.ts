import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { comparePassword, hashPassword, setAuthCookie, signAuthToken, clearAuthCookie } from '../lib/auth.js';
import { HttpError, asyncHandler } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { nextInvoiceNumber, toAuthUser, toBusinessProfile } from '../lib/serializers.js';
import { requireAuth } from '../middleware/requireAuth.js';

const authRouter = Router();

const baseCredentialsSchema = z.object({
  email: z.string().trim().email('A valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const registerSchema = baseCredentialsSchema.extend({
  companyName: z.string().trim().min(1, 'Company name is required'),
});

authRouter.post('/register', asyncHandler(async (request: Request, response: Response) => {
  const { email, password, companyName } = registerSchema.parse(request.body);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      companyName,
      contactEmail: email,
    },
  });

  setAuthCookie(response, signAuthToken({ userId: user.id }));

  response.status(201).json({
    user: toAuthUser(user),
    profile: toBusinessProfile(user),
    nextInvoiceNumber: nextInvoiceNumber(user),
  });
}));

authRouter.post('/login', asyncHandler(async (request: Request, response: Response) => {
  const { email, password } = baseCredentialsSchema.parse(request.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  setAuthCookie(response, signAuthToken({ userId: user.id }));

  response.json({
    user: toAuthUser(user),
    profile: toBusinessProfile(user),
    nextInvoiceNumber: nextInvoiceNumber(user),
  });
}));

authRouter.get('/me', requireAuth, asyncHandler(async (request: Request, response: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.auth!.userId },
  });

  if (!user) {
    throw new HttpError(404, 'User account not found');
  }

  response.json({
    user: toAuthUser(user),
    profile: toBusinessProfile(user),
    nextInvoiceNumber: nextInvoiceNumber(user),
  });
}));

authRouter.post('/logout', asyncHandler(async (_request: Request, response: Response) => {
  clearAuthCookie(response);
  response.json({ success: true });
}));

export { authRouter };
