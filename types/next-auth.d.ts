import { type UserRole } from "@prisma/client";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    branchId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      branchId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    branchId?: string | null;
  }
}
