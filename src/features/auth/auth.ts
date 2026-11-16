import "server-only";
import type { Role } from "@prisma/client";
import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/db/client";
import { authorizeCredentials } from "./credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}

function isRole(role: unknown): role is Role {
  return role === "ADMIN" || role === "OWNER" || role === "RENTER";
}

function clearIdentity(token: JWT) {
  delete token.sub;
  delete token.role;
  delete token.name;
  delete token.email;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const subject = user?.id ?? token.sub;
      const userId = Number(subject);
      if (!subject || !Number.isSafeInteger(userId) || userId < 1) {
        clearIdentity(token);
        return token;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true, role: true, isActive: true },
      });

      if (!currentUser || !currentUser.isActive) {
        clearIdentity(token);
        return token;
      }

      token.sub = String(currentUser.id);
      token.role = currentUser.role;
      token.name = currentUser.fullName;
      token.email = currentUser.email;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub && isRole(token.role)) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
