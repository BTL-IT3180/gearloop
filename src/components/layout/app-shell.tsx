import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import type { UserRole } from "./nav-items";
import { ToastProvider } from "../ui/toast";

interface AppShellProps {
  readonly children: ReactNode;
  readonly initialRole?: UserRole | "GUEST";
}

export function AppShell({ children, initialRole = "GUEST" }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <Navbar initialRole={initialRole} />
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
