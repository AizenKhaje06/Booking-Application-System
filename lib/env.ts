import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  PAYMONGO_SECRET_KEY: z.string().optional(),
  PAYMONGO_PUBLIC_KEY: z.string().optional(),
  PAYMONGO_WEBHOOK_SECRET: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("RestaurantHub"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function parseEnv<T extends z.ZodTypeAny>(schema: T, data: Record<string, string | undefined>) {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("[env] Validation warnings:", result.error.flatten().fieldErrors);
    return data as z.infer<T>;
  }
  return result.data;
}

export const serverEnv = parseEnv(serverSchema, {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
  PAYMONGO_SECRET_KEY: process.env.PAYMONGO_SECRET_KEY,
  PAYMONGO_PUBLIC_KEY: process.env.PAYMONGO_PUBLIC_KEY,
  PAYMONGO_WEBHOOK_SECRET: process.env.PAYMONGO_WEBHOOK_SECRET,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  CRON_SECRET: process.env.CRON_SECRET,
});

export const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

/** Call at build/runtime startup to fail fast in production when required secrets are missing. */
export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    missing.push("AUTH_SECRET (min 32 characters)");
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) missing.push("NEXT_PUBLIC_APP_URL");
  if (!process.env.CRON_SECRET) missing.push("CRON_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `[env] Production deployment missing required variables: ${missing.join(", ")}`,
    );
  }
}
