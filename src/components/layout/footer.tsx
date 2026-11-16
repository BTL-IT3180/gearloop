import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand col */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block font-bold text-lg tracking-tight text-slate-900 mb-2">
              Gear<span className="text-emerald-600">Loop</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm mb-3">
              Sàn cho thuê thiết bị ngang hàng: máy ảnh, dụng cụ, đồ dã ngoại.
              Lịch đặt rõ ràng, tiền cọc bảo vệ cả hai bên thông qua sổ ký quỹ minh bạch.
            </p>
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Đồ án môn IT3180 — Nhập môn Công nghệ phần mềm
            </div>
          </div>

          {/* Vai trò */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              3 Vai trò cốt lõi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium text-slate-700">Renter:</span> Thuê đồ theo lịch rảnh, cọc an toàn
              </li>
              <li>
                <span className="font-medium text-slate-700">Owner:</span> Đăng thiết bị, chống trùng lịch tự động
              </li>
              <li>
                <span className="font-medium text-slate-700">Admin:</span> Quản trị danh mục, phân xử biên bản 2 đầu
              </li>
            </ul>
          </div>

          {/* Liên kết */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Kỹ thuật & Dự án
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/api/health" className="hover:text-emerald-600 transition-colors">
                  Kiểm tra hệ thống (`/api/health`)
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/BTL-IT3180/gearloop"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-600 transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/BTL-IT3180/gearloop/issues/new?template=bug_report.yml&labels=bug"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 hover:text-amber-800 transition-colors"
                >
                  Báo lỗi trên GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 GearLoop Team. Demo phục vụ học tập môn IT3180, không phải sản phẩm thương mại.</p>
          <div className="flex gap-4">
            <span>Next.js 15 App Router</span>
            <span>•</span>
            <span>Tailwind CSS v4</span>
            <span>•</span>
            <span>Prisma 6 + PostgreSQL 16</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
