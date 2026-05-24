import type { NextAuthConfig } from "next-auth";

import { isAdminRole, isStaffRole } from "@/lib/auth/roles";

const authRoutes = [
  "/auth/sign-in",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export const authConfig = {
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const isAuthRoute = authRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      );

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (!isAdminRole(role)) {
          return Response.redirect(new URL("/auth/unauthorized", request.nextUrl));
        }
      }

      if (pathname.startsWith("/staff")) {
        if (!isLoggedIn) return false;
        if (!isStaffRole(role)) {
          return Response.redirect(new URL("/auth/unauthorized", request.nextUrl));
        }
      }

      if (pathname.startsWith("/account") || pathname.startsWith("/payments")) {
        if (!isLoggedIn) return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
