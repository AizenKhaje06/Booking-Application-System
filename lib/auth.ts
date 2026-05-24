import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { UserRole } from "@prisma/client";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.password) return null;

        const isValid = await compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          branchId: user.branchId,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (existing && !existing.role) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: UserRole.CUSTOMER },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, branchId: true, name: true, image: true },
        });
        const role = (user as { role?: UserRole }).role ?? dbUser?.role ?? UserRole.CUSTOMER;
        token.role = role;
        token.branchId =
          (user as { branchId?: string | null }).branchId ?? dbUser?.branchId ?? null;
        token.name = user.name ?? token.name;
        token.picture = user.image ?? token.picture;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        if (session.user.role) token.role = session.user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.branchId = (token.branchId as string | null | undefined) ?? null;
        session.user.name = token.name as string;
        session.user.image = (token.picture as string | undefined) ?? null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.CUSTOMER },
        });
      }
    },
  },
});
