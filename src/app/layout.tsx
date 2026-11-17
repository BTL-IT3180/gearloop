import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";
const vietnamese = localFont({
  src: [
    { path: "../../public/fonts/be-vietnam-pro-400.ttf", weight: "400" },
    { path: "../../public/fonts/be-vietnam-pro-500.ttf", weight: "500" },
    { path: "../../public/fonts/be-vietnam-pro-600.ttf", weight: "600" },
    { path: "../../public/fonts/be-vietnam-pro-700.ttf", weight: "700" },
    { path: "../../public/fonts/be-vietnam-pro-800.ttf", weight: "800" },
  ],
  variable: "--font-vietnamese",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "GearLoop — Thiết bị tốt, cho kế hoạch của bạn",
    template: "%s | GearLoop",
  },
  description:
    "Khám phá thế giới thiết bị cho thuê: máy ảnh, đồ cắm trại và dụng cụ. Lịch thuê rõ ràng, biên bản nhận trả và tiền cọc minh bạch.",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="vi" className={vietnamese.variable}>
      <body>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
