import type { Role } from "@prisma/client";
import Link from "next/link";
import { logoutAction } from "./actions";
import { getCurrentUser } from "@/lib/auth";

const roleLabels: Record<Role, string> = {
  ADMIN: "Quản trị",
  OWNER: "Chủ thiết bị",
  RENTER: "Người thuê",
};

export async function AuthNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" className="hover:text-emerald-700">
        Đăng nhập
      </Link>
    );
  }

  return (
    <>
      <span className="text-slate-600">
        {user.name} · {roleLabels[user.role]}
      </span>
      <form action={logoutAction}>
        <button type="submit" className="hover:text-emerald-700">
          Đăng xuất
        </button>
      </form>
    </>
  );
}
