import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Đăng nhập GearLoop</h1>
      <LoginForm />
    </section>
  );
}
