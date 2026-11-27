"use server";

import { CredentialsSignin } from "next-auth";
import { LockedAccountSignin, signIn, signOut } from "./auth";
import { errorMessage } from "@/lib/error-catalog";
import { loginSchema } from "@/lib/validation/auth";

export type LoginActionState = { error?: string };

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const credentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!credentials.success) {
    return { error: errorMessage("ERR-USR-010") };
  }

  try {
    await signIn("credentials", {
      ...credentials.data,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof LockedAccountSignin) {
      return { error: errorMessage("ERR-USR-011") };
    }
    if (error instanceof CredentialsSignin) {
      return { error: errorMessage("ERR-USR-010") };
    }
    throw error;
  }

  return {};
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
