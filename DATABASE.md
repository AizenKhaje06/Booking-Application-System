# Database Guide — RestaurantHub

PostgreSQL + Prisma ORM. Schema: `prisma/schema.prisma`. Details: `prisma/SCHEMA.md`.

## Local setup

```bash
cp .env.example .env
# Set DATABASE_URL

npm run db:push      # dev sync
npm run db:seed      # demo data
npm run db:studio    # GUI at localhost:5555
```

### Migrations (recommended)

```bash
npx prisma migrate dev --name init
npm run db:migrate   # future changes
```

## Production

1. Create managed Postgres (Vercel Postgres, Neon, Supabase, Railway)
2. Set `DATABASE_URL` on Vercel (use **pooled** URL for serverless)
3. Apply schema:

```bash
npm run db:migrate:deploy
# OR npm run db:push  (one-time only)
```

4. Seed optionally: `npm run db:seed` (review `prisma/seed.ts` first)

## Scripts

| Command             | Use                            |
| ------------------- | ------------------------------ |
| `db:generate`       | Regenerate Prisma Client       |
| `db:push`           | Dev schema sync                |
| `db:migrate`        | Create + apply migration (dev) |
| `db:migrate:deploy` | Apply migrations (prod)        |
| `db:seed`           | Seed data                      |
| `db:studio`         | Prisma Studio                  |

## Connection pooling

Use pooler URLs on Vercel/serverless:

- **Neon:** `-pooler` hostname
- **Supabase:** port `6543`
- **Vercel Postgres:** built-in

## Reset local DB (destructive)

```bash
npx prisma migrate reset
```

## Troubleshooting

| Error                | Fix                               |
| -------------------- | --------------------------------- |
| P1001                | Check DATABASE_URL, SSL, firewall |
| Too many connections | Use pooled URL                    |
| Client not found     | `npm run db:generate`             |
