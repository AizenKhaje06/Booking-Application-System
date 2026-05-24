# Deployment Guide — RestaurantHub on Vercel

Deploy RestaurantHub to **Vercel** with PostgreSQL, Auth.js, and optional integrations.

## Prerequisites

- Node.js 20+
- Git repository (GitHub, GitLab, or Bitbucket)
- [Vercel account](https://vercel.com)
- PostgreSQL ([Vercel Postgres](https://vercel.com/storage/postgres), Neon, Supabase, or Railway)

## 1. Prepare the repository

```bash
git clone <your-repo-url>
cd RestaurantHub
npm install
cp .env.example .env
npm run verify
npm run build
```

## 2. Create PostgreSQL

**Vercel Postgres:** Dashboard → Storage → Create Database → connect to project.

**External (Neon/Supabase):** Copy connection string; add `?sslmode=require` if needed.

See [DATABASE.md](./DATABASE.md) for schema setup.

## 3. Deploy to Vercel

**Git:** [vercel.com/new](https://vercel.com/new) → Import repo → Next.js preset.

**CLI:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 4. Environment variables

Set in **Vercel → Settings → Environment Variables**:

| Variable               | Required | Notes                         |
| ---------------------- | -------- | ----------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL URL                |
| `AUTH_SECRET`          | Yes      | `openssl rand -base64 32`     |
| `AUTH_URL`             | Yes      | `https://your-app.vercel.app` |
| `AUTH_TRUST_HOST`      | Yes      | `true` on Vercel              |
| `NEXT_PUBLIC_APP_URL`  | Yes      | Same as AUTH_URL              |
| `CRON_SECRET`          | Yes      | `openssl rand -base64 32`     |
| `NEXT_PUBLIC_APP_NAME` | No       | Default: RestaurantHub        |
| `RESEND_*`             | No       | Email                         |
| `PAYMONGO_*`           | No       | Payments                      |
| `TWILIO_*`             | No       | SMS                           |
| `UPLOADTHING_*`        | No       | Uploads                       |
| `AUTH_GOOGLE_*`        | No       | Google OAuth                  |

Redeploy after changing env vars.

## 5. Database (first deploy)

```bash
npm run db:generate
npm run db:migrate:deploy   # preferred
# OR npm run db:push        # prototype only
npm run db:seed             # optional
```

## 6. Post-deploy checklist

- [ ] Homepage, sign-in, admin, reservations, events work
- [ ] `/robots.txt` and `/sitemap.xml` load
- [ ] PayMongo webhook: `https://your-domain.com/api/paymongo/webhook`
- [ ] Cron hourly via `vercel.json`

## 7. Custom domain

Add domain in Vercel → Settings → Domains. Update `AUTH_URL` and `NEXT_PUBLIC_APP_URL`. Redeploy.

## 8. Cron

`vercel.json` runs `/api/cron/notifications` hourly. Set `CRON_SECRET`; Vercel sends `Authorization: Bearer <CRON_SECRET>`.

## 9. Webhooks

**PayMongo:** URL `https://your-domain.com/api/paymongo/webhook`, events `checkout_session.payment.paid`, `payment.failed`. Set `PAYMONGO_WEBHOOK_SECRET`.

## 10. Security (built-in)

Headers in `next.config.ts`: HSTS, X-Frame-Options, CSP, etc.

`instrumentation.ts` validates required production env vars at startup.

## 11. Performance

- AVIF/WebP images, font optimization, compression, package import optimization

## 12. Troubleshooting

| Issue              | Fix                                         |
| ------------------ | ------------------------------------------- |
| Build fails        | Run `npm run verify`; check Vercel env      |
| Auth redirect loop | Match `AUTH_URL` to production URL exactly  |
| DB connection      | Use pooled URL + SSL                        |
| Cron 401           | Set `CRON_SECRET`                           |
| Images blocked     | Add host to `next.config.ts` remotePatterns |

See [DATABASE.md](./DATABASE.md) for migrations.
