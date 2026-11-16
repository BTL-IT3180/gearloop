import Link from "next/link";
import { errorCatalog } from "../lib/error-catalog";
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from "../components/ui";

export default function NotFound() {
  const err = errorCatalog["ERR-USR-004"];

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <Card className="max-w-md w-full border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="warning" size="sm">
              Mã lỗi: ERR-USR-004 (HTTP {err.status})
            </Badge>
          </div>
          <CardTitle className="text-xl">Không tìm thấy tài nguyên</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed">
            {err.message}
          </p>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
          <Link href="/" className="w-full">
            <Button variant="primary" fullWidth>
              Về trang chủ
            </Button>
          </Link>
          <Link href="/items" className="w-full">
            <Button variant="outline" fullWidth>
              Khám phá thiết bị
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
