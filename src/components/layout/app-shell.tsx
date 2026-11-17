import type { ReactNode } from "react";
import type { CurrentUser } from "@/lib/auth";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ToastProvider } from "../ui/toast";
export function AppShell({
  children,
  user,
}: {
  readonly children: ReactNode;
  readonly user: CurrentUser | null;
}) {
  return (
    <ToastProvider>
      <Navbar user={user} />
      <main id="noi-dung" className="site-main">
        {children}
      </main>
      <Footer />
    </ToastProvider>
  );
}
