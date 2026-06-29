# Salzburg Box Cricket

Full-stack MVP for an indoor box cricket facility in Salzburg. Customers can view courts, book slots, make a fake MVP payment, and see dashboard activity. Admins can review bookings, prices, courts, customers, tournaments, and payments.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Stripe-ready payment shape, with fake payment enabled for the MVP

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env
```

3. Start PostgreSQL and update `DATABASE_URL` in `.env`.

4. Generate Prisma client and push the schema:

```bash
npm run db:generate
npm run db:push
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## MVP Login

The MVP uses a front-end mock login so you can move through the app immediately:

- Customer: any email and password
- Admin: use an email containing `admin`, such as `admin@salzburgboxcricket.at`

## Stripe Later

The booking flow currently uses a fake payment button. Replace it with Stripe Checkout by creating a checkout session in an API route, storing the pending booking, and confirming payment from the Stripe webhook.
