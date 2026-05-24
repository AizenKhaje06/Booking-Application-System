# RestaurantHub

Production-ready restaurant platform: **3 branches**, table reservations, PayMongo deposits, and **2nd-floor event venue** booking.

## Features

- Multi-branch table reservations with real-time availability
- Event venue (Skyline Event Hall) with admin approval
- Role-based admin (Super Admin, Branch Admin, Staff, Customer)
- PayMongo payments, Resend email, Twilio SMS
- Luxury UI (Framer Motion, shadcn/ui, mobile-first)
- SEO: sitemap, robots.txt, Open Graph, JSON-LD

## Tech Stack

Next.js 15 · TypeScript · Tailwind v4 · shadcn/ui · PostgreSQL · Prisma · NextAuth v5 · Zustand · Framer Motion · Recharts · UploadThing · Resend · PayMongo

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo login** (password `Password123!`): `superadmin@restauranthub.com`, `customer@example.com`

## Scripts

| Script                      | Description                   |
| --------------------------- | ----------------------------- |
| `npm run dev`               | Development server            |
| `npm run build`             | Production build              |
| `npm run verify`            | Typecheck + lint + format     |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:seed`           | Seed database                 |

## Environment

Copy `.env.example` to `.env`. **Required in production:**

- `DATABASE_URL` — PostgreSQL
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` — deployment URL
- `CRON_SECRET` — cron auth

Optional: `RESEND_*`, `PAYMONGO_*`, `TWILIO_*`, `UPLOADTHING_*`, `AUTH_GOOGLE_*`

## Deployment

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Vercel deployment guide
- **[DATABASE.md](./DATABASE.md)** — Migrations and PostgreSQL setup

## Structure

```
app/          Routes, API, sitemap, robots, manifest
components/   UI, admin, booking, events
lib/          Auth, env, seo, security
prisma/       Schema, seed, migrations
actions/      Server actions
services/     Email, PayMongo, notifications
```

## Routes

| Route           | Description        |
| --------------- | ------------------ |
| `/`             | Homepage           |
| `/reservations` | Book a table       |
| `/events`       | Event venue        |
| `/account`      | Customer dashboard |
| `/admin`        | Admin dashboard    |

## Production Checklist

- [ ] Vercel env vars set
- [ ] Database migrated (`db:migrate:deploy`)
- [ ] PayMongo webhook configured
- [ ] Custom domain + AUTH_URL updated
- [ ] `npm run verify` passes

---

© RestaurantHub
