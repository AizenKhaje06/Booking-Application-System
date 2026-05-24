export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL === "1"
  ) {
    const { assertProductionEnv } = await import("@/lib/env");
    assertProductionEnv();
  }
}
