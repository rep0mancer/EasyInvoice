import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { nextInvoiceNumber, toBusinessProfile } from '../lib/serializers.js';
import { requireAuth } from '../middleware/requireAuth.js';

const profileRouter = Router();

const profileSchema = z.object({
  companyName: z.string().trim(),
  address: z.string().trim(),
  city: z.string().trim(),
  postalCode: z.string().trim(),
  country: z.string().trim().min(2),
  vatId: z.string().trim(),
  phone: z.string().trim(),
  email: z.string().trim().email('A valid business email is required'),
  logo: z.string().trim().optional().default(''),
});

profileRouter.use(requireAuth);

profileRouter.get('/', asyncHandler(async (request: Request, response: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.auth!.userId },
  });

  if (!user) {
    throw new HttpError(404, 'User account not found');
  }

  response.json({
    profile: toBusinessProfile(user),
    nextInvoiceNumber: nextInvoiceNumber(user),
  });
}));

profileRouter.put('/', asyncHandler(async (request: Request, response: Response) => {
  const payload = profileSchema.parse(request.body);

  const user = await prisma.user.update({
    where: { id: request.auth!.userId },
    data: {
      companyName: payload.companyName,
      address: payload.address,
      city: payload.city,
      postalCode: payload.postalCode,
      country: payload.country,
      vatId: payload.vatId || null,
      phone: payload.phone || null,
      contactEmail: payload.email,
      logo: payload.logo || null,
    },
  });

  response.json({
    profile: toBusinessProfile(user),
    nextInvoiceNumber: nextInvoiceNumber(user),
  });
}));

export { profileRouter };
