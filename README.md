# EasyInvoice.at

EasyInvoice is now a full-stack invoicing app with a React + Vite client and an authenticated Express + Prisma API backed by PostgreSQL.

## Stack

- React 18 + Vite + TypeScript
- Zustand for client-side UI/session state
- Node.js + Express API
- Prisma ORM
- PostgreSQL
- JWT auth stored in an HTTP-only cookie
- jsPDF + XRechnung XML export on the client

## Architecture

- The browser no longer persists business data in `localStorage`.
- The Express server is the source of truth for users, clients, invoices, and invoice numbering.
- Prisma enforces strict relational schemas for `User`, `Client`, `Invoice`, and `InvoiceItem`.
- Every protected query is scoped by the authenticated `userId`, so tenant data stays isolated.
- The frontend fetches and mutates data through REST endpoints under `/api`.

## Project Structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── server/
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       ├── lib/
│       ├── middleware/
│       └── routes/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── store/
│   └── types/
└── .env.example
```

## Environment

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL`
- `JWT_SECRET`
- `API_PORT`

## Scripts

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Available commands:

- `npm run dev` starts the Vite client and Express API together
- `npm run dev:client` starts the client only
- `npm run dev:server` starts the API only
- `npm run build` builds both client and server
- `npm run db:generate` generates the Prisma client
- `npm run db:migrate` runs Prisma migrations

## API Surface

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Profile:

- `GET /api/profile`
- `PUT /api/profile`

Clients:

- `GET /api/clients`
- `POST /api/clients`
- `PUT /api/clients/:clientId`
- `DELETE /api/clients/:clientId`

Invoices:

- `GET /api/invoices`
- `GET /api/invoices/:invoiceId`
- `POST /api/invoices`
- `PUT /api/invoices/:invoiceId`
- `PATCH /api/invoices/:invoiceId/payment`
- `DELETE /api/invoices/:invoiceId`

## Notes

- Invoice totals and invoice numbers are calculated on the server.
- The client still handles PDF and XRechnung file generation, but only from server-fetched data.
- The current `lint` script still requires an `eslint.config.js` migration for ESLint 9.
