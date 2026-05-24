export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/account/:path*",
    "/payments/:path*",
    "/auth/:path*",
  ],
};
