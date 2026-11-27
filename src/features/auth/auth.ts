import "server-only";
import type { Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { errorCatalog } from "@/lib/error-catalog";
import { revokeAuthSession } from "@/server/repositories/auth-session";
import { authorizeCredentials } from "./credentials";
import { validateSessionToken } from "./session-token";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
    logoutSessionId?: string;
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    sessionId?: string;
  }
}

function isRole(role: unknown): role is Role {
  return role === "ADMIN" || role === "OWNER" || role === "RENTER";
}

const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // ADR-008: 8 giờ.
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
    jwt({ token, user }) {
      return validateSessionToken({ ...token, sub: user?.id ?? token.sub }, Boolean(user));
    },
    session({ session, token }) {
      if (session.user && token.sub && isRole(token.role)) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

const { auth, signIn, signOut, handlers: authHandlers } = NextAuth(authConfig);
export { auth, signIn };

// Read only the verified JWT for logout. This private session projection is
// never served to the client and works even when the account was just locked.
const { auth: readLogoutSession } = NextAuth({
  ...authConfig,
  callbacks: {
    jwt: ({ token }) => token,
    session: ({ session, token }) => ({
      ...session,
      logoutSessionId: typeof token.sessionId === "string" ? token.sessionId : undefined,
    }),
  },
});

export async function revokeAndSignOut(): Promise<void> {
  const session = await readLogoutSession();
  if (session?.logoutSessionId) await revokeAuthSession(session.logoutSessionId);
  await signOut({ redirectTo: "/" });
}

export const handlers = {
  GET: authHandlers.GET,
  async POST(request: NextRequest) {
    // Let Auth.js validate the request and prepare its response, then persist
    // revocation before releasing the response that clears the cookie.
    let sessionId: string | undefined;
    const { handlers } = NextAuth({
      ...authConfig,
      events: {
        signOut(message) {
          if ("token" in message) sessionId = message.token?.sessionId;
        },
      },
    });
    const response = await handlers.POST(request);
    if (typeof sessionId !== "string") return response;

    try {
      await revokeAuthSession(sessionId);
      return response;
    } catch {
      const { message, status } = errorCatalog["ERR-SYS-001"];
      return Response.json({ error: message, code: "ERR-SYS-001" }, { status });
    }
  },
};
