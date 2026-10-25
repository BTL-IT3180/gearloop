import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GearLoop — Cho thuê thiết bị ngang hàng",
  description:
    "Sàn cho thuê thiết bị P2P: máy ảnh, dụng cụ, đồ cắm trại. Lịch đặt rõ ràng, tiền cọc bảo vệ cả hai bên. Dự án môn IT3180.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight">
              Gear<span className="text-emerald-600">Loop</span>
            </Link>
            <nav className="text-sm flex gap-4">
              <Link href="/" className="hover:text-emerald-700">
                Trang chủ
              </Link>
              <a
                href="https://github.com/BTL-IT3180/gearloop/issues/new?template=bug_report.yml&labels=bug"
                className="hover:text-emerald-700"
                target="_blank"
                rel="noreferrer"
              >
                Báo lỗi
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-slate-500">
            Dự án môn IT3180 — Nhập môn Công nghệ phần mềm · Demo phục vụ học
            tập, không phải sản phẩm production.
          </div>
        </footer>
      </body>
    </html>
  );
}
