import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { Icon } from "@/components/ui/icon";

export const metadata = { title: "Đăng nhập" };
export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <section className="auth-section page-width">
      <nav className="auth-breadcrumb" aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span>Đăng nhập</span>
      </nav>
      <div className="auth-grid">
        <aside className="auth-story">
          <span>Có kế hoạch? Có GearLoop.</span>
          <h2>
            Thiết bị cho hôm nay.
            <br />
            Trải nghiệm để nhớ lâu.
          </h2>
          <p>
            Đăng nhập để bắt đầu cùng GearLoop. Một tài khoản, những kế hoạch
            mới.
          </p>
          <div className="auth-story-image">
            <Image
              src="/images/camera.jpg"
              alt="Máy ảnh và ống kính"
              fill
              sizes="(max-width: 700px) 0px, 500px"
            />
          </div>
        </aside>
        <div className="auth-form-panel">
          <h1>Đăng nhập GearLoop</h1>
          <p className="auth-intro">
            Chào mừng bạn quay lại.
            <br />
            Nhập thông tin tài khoản để tiếp tục.
          </p>
          <LoginForm />
          <p className="auth-note">
            Dùng tài khoản đã được cấp để đăng nhập bản trải nghiệm. Nếu cần hỗ
            trợ, hãy liên hệ nhóm GearLoop.
          </p>
          <div className="auth-footer">
            <Icon name="shield" size={17} />
            Thông tin đăng nhập được kiểm tra an toàn.
          </div>
        </div>
      </div>
    </section>
  );
}
