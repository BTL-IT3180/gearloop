"use client";

import { useEffect } from "react";
import Link from "next/link";
import { errorCatalog } from "../lib/error-catalog";
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from "../components/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const err = errorCatalog["ERR-SYS-001"];

  useEffect(() => {
    // Ghi log mã digest cho quản trị viên, không in secret hay input thô (ADR-006 / AGENTS.md §4)
    console.error("[system error boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <Card className="max-w-md w-full border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="danger" size="sm">
              Mã lỗi: ERR-SYS-001 (HTTP {err.status})
            </Badge>
          </div>
          <CardTitle className="text-xl text-red-700">Hệ thống gặp sự cố</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed">
            {err.message}
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 font-mono mt-3">
              Mã truy vết: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
          <Button variant="danger" onClick={() => reset()} fullWidth>
            Thử lại
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" fullWidth>
              Về trang chủ
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
