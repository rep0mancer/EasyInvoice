import { Request, Response, Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { calculateTotals, formatInvoiceNumber, parseDateInput } from '../lib/invoices.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { nextInvoiceNumber, toInvoice } from '../lib/serializers.js';
import { requireAuth } from '../middleware/requireAuth.js';

const invoicesRouter = Router();

const lineItemSchema = z.object({
  description: z.string().trim().min(1, 'Each line item needs a description'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  vatRate: z.number().int().min(0).max(100),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional().default(''),
});

const paymentSchema = z.object({
  paid: z.boolean(),
  method: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
});

const invoiceInclude = {
  client: true,
  items: {
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.InvoiceInclude;

async function findOwnedInvoice(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
    include: invoiceInclude,
  });

  if (!invoice) {
    throw new HttpError(404, 'Invoice not found');
  }

  return invoice;
}

async function findOwnedClient(clientId: string, userId: string) {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId,
    },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  return client;
}

invoicesRouter.use(requireAuth);

invoicesRouter.get('/', asyncHandler(async (request: Request, response: Response) => {
  const invoices = await prisma.invoice.findMany({
    where: { userId: request.auth!.userId },
    include: invoiceInclude,
    orderBy: { createdAt: 'desc' },
  });

  response.json({
    invoices: invoices.map(toInvoice),
  });
}));

invoicesRouter.get('/:invoiceId', asyncHandler(async (request: Request, response: Response) => {
  const invoice = await findOwnedInvoice(String(request.params.invoiceId), request.auth!.userId);
  response.json({ invoice: toInvoice(invoice) });
}));

invoicesRouter.post('/', asyncHandler(async (request: Request, response: Response) => {
  const payload = invoiceSchema.parse(request.body);
  const userId = request.auth!.userId;
  const invoiceDate = parseDateInput(payload.invoiceDate);
  const dueDate = parseDateInput(payload.dueDate);
  const totals = calculateTotals(payload.items);

  await findOwnedClient(payload.clientId, userId);

  const result = await prisma.$transaction(async transaction => {
    const user = await transaction.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpError(404, 'User account not found');
    }

    const invoice = await transaction.invoice.create({
      data: {
        userId,
        clientId: payload.clientId,
        invoiceNumber: formatInvoiceNumber(user.nextInvoiceSequence, invoiceDate),
        invoiceDate,
        dueDate,
        subtotal: totals.subtotal,
        vatTotal: totals.vatTotal,
        total: totals.total,
        notes: payload.notes,
        items: {
          create: payload.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
          })),
        },
      },
      include: invoiceInclude,
    });

    const updatedUser = await transaction.user.update({
      where: { id: userId },
      data: {
        nextInvoiceSequence: {
          increment: 1,
        },
      },
    });

    return {
      invoice,
      nextInvoiceNumber: nextInvoiceNumber(updatedUser),
    };
  });

  response.status(201).json({
    invoice: toInvoice(result.invoice),
    nextInvoiceNumber: result.nextInvoiceNumber,
  });
}));

invoicesRouter.put('/:invoiceId', asyncHandler(async (request: Request, response: Response) => {
  const payload = invoiceSchema.parse(request.body);
  const userId = request.auth!.userId;
  const invoiceDate = parseDateInput(payload.invoiceDate);
  const dueDate = parseDateInput(payload.dueDate);
  const totals = calculateTotals(payload.items);
  const existingInvoice = await findOwnedInvoice(String(request.params.invoiceId), userId);
  await findOwnedClient(payload.clientId, userId);

  const invoice = await prisma.$transaction(async transaction => {
    await transaction.invoiceItem.deleteMany({
      where: { invoiceId: existingInvoice.id },
    });

    return transaction.invoice.update({
      where: { id: existingInvoice.id },
      data: {
        clientId: payload.clientId,
        invoiceDate,
        dueDate,
        subtotal: totals.subtotal,
        vatTotal: totals.vatTotal,
        total: totals.total,
        notes: payload.notes,
        items: {
          create: payload.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
          })),
        },
      },
      include: invoiceInclude,
    });
  });

  response.json({
    invoice: toInvoice(invoice),
  });
}));

invoicesRouter.patch('/:invoiceId/payment', asyncHandler(async (request: Request, response: Response) => {
  const payload = paymentSchema.parse(request.body);
  const invoice = await findOwnedInvoice(String(request.params.invoiceId), request.auth!.userId);

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      paid: payload.paid,
      paidMethod: payload.method || null,
      paidNotes: payload.notes || null,
      paidDate: payload.paid ? new Date() : null,
    },
    include: invoiceInclude,
  });

  response.json({
    invoice: toInvoice(updatedInvoice),
  });
}));

invoicesRouter.delete('/:invoiceId', asyncHandler(async (request: Request, response: Response) => {
  const invoice = await findOwnedInvoice(String(request.params.invoiceId), request.auth!.userId);

  await prisma.invoice.delete({
    where: { id: invoice.id },
  });

  response.json({ success: true });
}));

export { invoicesRouter };
