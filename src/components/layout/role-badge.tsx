import type { UserRole } from "./nav-items";

interface RoleBadgeProps {
  readonly role: UserRole | "GUEST";
}

const ROLE_CONFIG: Record<
  UserRole | "GUEST",
  { readonly label: string; readonly className: string }
> = {
  ADMIN: {
    label: "Quản trị viên (Admin)",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  OWNER: {
    label: "Chủ thiết bị (Owner)",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  RENTER: {
    label: "Người thuê (Renter)",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  GUEST: {
    label: "Khách (Chưa đăng nhập)",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
