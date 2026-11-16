import type { Metadata } from "next";
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
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
