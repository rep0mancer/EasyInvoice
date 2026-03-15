import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { toClient } from '../lib/serializers.js';
import { requireAuth } from '../middleware/requireAuth.js';

const clientsRouter = Router();

const clientSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required'),
  address: z.string().trim().min(1, 'Client address is required'),
  vatId: z.string().trim().optional().default(''),
});

clientsRouter.use(requireAuth);

clientsRouter.get('/', asyncHandler(async (request: Request, response: Response) => {
  const clients = await prisma.client.findMany({
    where: { userId: request.auth!.userId },
    orderBy: { name: 'asc' },
  });

  response.json({
    clients: clients.map(toClient),
  });
}));

clientsRouter.post('/', asyncHandler(async (request: Request, response: Response) => {
  const payload = clientSchema.parse(request.body);

  const client = await prisma.client.create({
    data: {
      userId: request.auth!.userId,
      name: payload.name,
      address: payload.address,
      vatId: payload.vatId || null,
    },
  });

  response.status(201).json({
    client: toClient(client),
  });
}));

clientsRouter.put('/:clientId', asyncHandler(async (request: Request, response: Response) => {
  const payload = clientSchema.parse(request.body);
  const clientId = String(request.params.clientId);

  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId: request.auth!.userId,
    },
  });

  if (!existingClient) {
    throw new HttpError(404, 'Client not found');
  }

  const client = await prisma.client.update({
    where: { id: existingClient.id },
    data: {
      name: payload.name,
      address: payload.address,
      vatId: payload.vatId || null,
    },
  });

  response.json({
    client: toClient(client),
  });
}));

clientsRouter.delete('/:clientId', asyncHandler(async (request: Request, response: Response) => {
  const clientId = String(request.params.clientId);
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId: request.auth!.userId,
    },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  const invoiceCount = await prisma.invoice.count({
    where: {
      clientId: client.id,
      userId: request.auth!.userId,
    },
  });

  if (invoiceCount > 0) {
    throw new HttpError(409, 'This client cannot be deleted because invoices are attached to it');
  }

  await prisma.client.delete({
    where: { id: client.id },
  });

  response.json({ success: true });
}));

export { clientsRouter };
