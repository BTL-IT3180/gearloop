"use client";
import { useEffect } from "react";
import Link from "next/link";
import { errorCatalog } from "@/lib/error-catalog";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Raw client/server error messages may contain request or database details.
    console.error("[system error boundary]", error.digest ?? "unavailable");
  }, [error]);
  return (
    <section className="state-page">
      <div className="state-content">
        <div className="state-number" aria-hidden="true">
          500
        </div>
        <h1>Có gián đoạn khi tải trang.</h1>
        <p>{errorCatalog["ERR-SYS-001"].message}</p>
        <div className="state-actions">
          <Button onClick={reset}>Thử lại</Button>
          <Link className="action-link action-outline" href="/">
            Về trang chủ
          </Link>
        </div>
        {error.digest && (
          <span className="state-code">Mã truy vết: {error.digest}</span>
        )}
      </div>
    </section>
  );
}
