import Link from "next/link";
import { Icon } from "../ui/icon";
export function Footer() {
  return (
    <footer className="site-footer">
      <a href="#dau-trang" className="back-to-top">
        Về đầu trang <span aria-hidden="true">↑</span>
      </a>
      <div className="page-width footer-grid">
        <div className="footer-brand">
          <Link className="wordmark" href="/">
            GearLoop
            <span className="brand-loop" aria-hidden="true" />
          </Link>
          <p>
            Đồ tốt không nhất thiết phải mua.
            <br />
            Cùng dùng, cùng tạo thêm trải nghiệm.
          </p>
        </div>
        <div>
          <h2>Khám phá</h2>
          <Link href="/?category=camera#danh-muc">Máy ảnh & quay phim</Link>
          <Link href="/?category=outdoor#danh-muc">Cắm trại & dã ngoại</Link>
          <Link href="/?category=tools#danh-muc">Dụng cụ & sửa chữa</Link>
        </div>
        <div>
          <h2>Thuê cùng GearLoop</h2>
          <Link href="/#cach-hoat-dong">Quy trình nhận & trả</Link>
          <Link href="/#tien-coc">Tìm hiểu về tiền cọc</Link>
          <Link href="/login">Tài khoản của bạn</Link>
        </div>
        <div className="footer-help">
          <Icon name="shield" size={28} />
          <h2>Minh bạch từ đầu</h2>
          <p>
            Lịch thuê, khoản cọc và tình trạng thiết bị được ghi nhận rõ ràng.
          </p>
          <a
            href="https://github.com/BTL-IT3180/gearloop/issues/new?template=bug_report.yml&labels=bug"
            target="_blank"
            rel="noreferrer"
          >
            Báo lỗi cho nhóm
          </a>
        </div>
      </div>
      <div className="page-width footer-bottom">
        <span>© 2026 GearLoop. Đồ án IT3180.</span>
        <span>Bản demo phục vụ học tập · Chưa có thanh toán thật</span>
      </div>
    </footer>
  );
}
