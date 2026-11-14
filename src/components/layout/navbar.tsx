"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROLE_NAVIGATION, PUBLIC_NAVIGATION, type UserRole } from "./nav-items";
import { RoleBadge } from "./role-badge";

interface NavbarProps {
  readonly initialRole?: UserRole | "GUEST";
}

const PREVIEW_ROLE_KEY = "gearloop_preview_role";

export function Navbar({ initialRole = "GUEST" }: NavbarProps) {
  const [currentRole, setCurrentRole] = useState<UserRole | "GUEST">(initialRole);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Đồng bộ initialRole từ server cookie nếu có thay đổi
  useEffect(() => {
    setCurrentRole(initialRole);
  }, [initialRole]);

  const handleRoleChange = (role: UserRole | "GUEST") => {
    setCurrentRole(role);
    try {
      // Ghi cookie để server Next.js đọc được ngay lập tức ở lần render sau (loại bỏ hiện tượng nháy role khách)
      document.cookie = `${PREVIEW_ROLE_KEY}=${role}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem(PREVIEW_ROLE_KEY, role);
    } catch {
      // Bỏ qua lỗi storage/cookie
    }
  };

  const activeNavLinks =
    currentRole === "GUEST" ? PUBLIC_NAVIGATION : ROLE_NAVIGATION[currentRole];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-extrabold text-sm shadow-sm">
              GL
            </span>
            <span>
              Gear<span className="text-emerald-600">Loop</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {activeNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Role Preview Switcher + User Area */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {/* Quick role switcher for testing & review */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <span className="font-semibold text-slate-500 pl-1">Xem vai:</span>
            <select
              aria-label="Chọn vai trò để xem giao diện"
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole | "GUEST")}
              className="rounded bg-white px-2 py-1 font-medium text-slate-800 border border-slate-200 shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="GUEST">Khách (Chưa đăng nhập)</option>
              <option value="RENTER">Người thuê (Renter)</option>
              <option value="OWNER">Chủ thiết bị (Owner)</option>
              <option value="ADMIN">Quản trị viên (Admin)</option>
            </select>
          </div>

          {/* Role Status Tag */}
          <RoleBadge role={currentRole} />

          {/* User actions */}
          {currentRole === "GUEST" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                {currentRole[0]}
              </div>
              <button
                type="button"
                onClick={() => handleRoleChange("GUEST")}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <RoleBadge role={currentRole} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Mở menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-5 md:hidden">
          {/* Mobile role switcher */}
          <div className="mb-4 rounded-lg bg-slate-50 p-2 border border-slate-200">
            <label htmlFor="mobile-role-select" className="block text-xs font-semibold text-slate-500 mb-1">
              Chuyển vai trò xem thử:
            </label>
            <select
              id="mobile-role-select"
              value={currentRole}
              onChange={(e) => {
                handleRoleChange(e.target.value as UserRole | "GUEST");
                setMobileMenuOpen(false);
              }}
              className="w-full rounded bg-white px-2 py-1.5 text-sm font-medium text-slate-800 border border-slate-200"
            >
              <option value="GUEST">Khách (Chưa đăng nhập)</option>
              <option value="RENTER">Người thuê (Renter)</option>
              <option value="OWNER">Chủ thiết bị (Owner)</option>
              <option value="ADMIN">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div className="space-y-1">
            {activeNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
            {currentRole === "GUEST" ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-md bg-emerald-600 py-2 text-sm font-medium text-white"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleRoleChange("GUEST");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center rounded-md border border-slate-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
