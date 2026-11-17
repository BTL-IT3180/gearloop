import Link from "next/link";
import { errorCatalog } from "@/lib/error-catalog";
export default function NotFound() {
  const error = errorCatalog["ERR-USR-004"];
  return (
    <section className="state-page">
      <div className="state-content">
        <div className="state-number" aria-hidden="true">
          404
        </div>
        <h1>Trang bạn tìm không có ở đây.</h1>
        <p>
          Đường dẫn có thể đã thay đổi hoặc trang chưa được mở. Quay về trang
          chủ để tiếp tục khám phá GearLoop.
        </p>
        <div className="state-actions">
          <Link className="action-link action-primary" href="/">
            Về trang chủ
          </Link>
          <Link className="action-link action-outline" href="/#danh-muc">
            Khám phá danh mục
          </Link>
        </div>
        <span className="state-code">{error.message} · ERR-USR-004</span>
      </div>
    </section>
  );
}
