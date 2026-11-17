"use client";
import Link from "next/link";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { CurrentUser } from "@/lib/auth";
import { logoutAction } from "@/features/auth/actions";
import { ROLE_NAVIGATION } from "./nav-items";
import { Icon } from "../ui/icon";

const labels = {
  ADMIN: "Quản trị",
  OWNER: "Chủ thiết bị",
  RENTER: "Người thuê",
};

export function Navbar({ user }: { readonly user: CurrentUser | null }) {
  const drawer = useRef<HTMLDialogElement>(null);
  const searchParams = useSearchParams();
  const links = user ? ROLE_NAVIGATION[user.role] : [];
  const close = () => drawer.current?.close();
  return (
    <header className="site-header" id="dau-trang">
      <a className="skip-link" href="#noi-dung">
        Chuyển đến nội dung
      </a>
      <div className="header-main page-width">
        <Link className="wordmark" href="/" aria-label="GearLoop, trang chủ">
          GearLoop
          <span className="brand-loop" aria-hidden="true" />
        </Link>
        <span className="header-purpose">
          <Icon name="pin" />
          Thuê đồ cho
          <br />
          <strong>kế hoạch của bạn</strong>
        </span>
        <form
          className="header-search"
          action="/#danh-muc"
          role="search"
          key={searchParams.toString()}
        >
          <label className="sr-only" htmlFor="search-category">
            Danh mục
          </label>
          <select
            name="category"
            id="search-category"
            defaultValue={searchParams.get("category") ?? ""}
          >
            <option value="">Tất cả</option>
            <option value="camera">Máy ảnh</option>
            <option value="outdoor">Dã ngoại</option>
            <option value="tools">Dụng cụ</option>
          </select>
          <label className="sr-only" htmlFor="header-query">
            Tìm danh mục thiết bị
          </label>
          <input
            id="header-query"
            name="q"
            type="search"
            maxLength={120}
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="Bạn cần gì cho kế hoạch tiếp theo?"
          />
          <button type="submit" aria-label="Tìm danh mục">
            <Icon name="search" />
          </button>
        </form>
        <div className="header-account">
          {user ? (
            <>
              <span className="account-identity">
                {user.name} · {labels[user.role]}
              </span>
              <form action={logoutAction}>
                <button className="logout-button" type="submit">
                  Đăng xuất <Icon name="logout" size={15} />
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="account-link">
              <span>Chào bạn,</span>
              <strong>
                Đăng nhập <Icon name="user" size={18} />
              </strong>
            </Link>
          )}
        </div>
        <button
          className="mobile-menu-button"
          aria-label="Mở menu"
          onClick={() => drawer.current?.showModal()}
        >
          <Icon name="menu" />
        </button>
      </div>
      <div className="header-subbar">
        <nav
          className="page-width category-navigation"
          aria-label="Điều hướng chính"
        >
          <button
            className="all-categories"
            onClick={() => drawer.current?.showModal()}
          >
            <Icon name="menu" size={18} />
            Khám phá
          </button>
          <Link href="/?category=camera#danh-muc">Máy ảnh & quay phim</Link>
          <Link href="/?category=outdoor#danh-muc">Cắm trại & dã ngoại</Link>
          <Link href="/?category=tools#danh-muc">Dụng cụ & sửa chữa</Link>
          <Link href="/#cach-hoat-dong">Cách thuê thiết bị</Link>
          <span className="subbar-note">
            <Icon name="shield" size={16} />
            Rõ lịch thuê. Rõ tiền cọc.
          </span>
        </nav>
      </div>
      <dialog
        ref={drawer}
        className="navigation-drawer"
        aria-labelledby="drawer-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="drawer-heading">
          <div>
            <span>GearLoop</span>
            <h2 id="drawer-title">
              {user ? labels[user.role] : "Khám phá cùng GearLoop"}
            </h2>
          </div>
          <button aria-label="Đóng menu" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Menu tài khoản" className="drawer-content">
          <Link href="/" onClick={close}>
            Trang chủ
            <Icon name="arrow" size={16} />
          </Link>
          <Link href="/#danh-muc" onClick={close}>
            Danh mục thiết bị
            <Icon name="arrow" size={16} />
          </Link>
          <Link href="/#cach-hoat-dong" onClick={close}>
            Cách thuê & tiền cọc
            <Icon name="arrow" size={16} />
          </Link>
          {user && (
            <div className="drawer-section">
              <h3>Dành cho {labels[user.role].toLowerCase()}</h3>
              {links.map((item) => (
                <span
                  className="upcoming-link"
                  key={item.href}
                  aria-disabled="true"
                >
                  {item.label}
                  <small>Sắp có</small>
                </span>
              ))}
            </div>
          )}
          {user ? (
            <form action={logoutAction} onSubmit={close}>
              <button className="drawer-signout" type="submit">
                Đăng xuất
                <Icon name="logout" size={18} />
              </button>
            </form>
          ) : (
            <Link className="drawer-login" href="/login" onClick={close}>
              Đăng nhập
              <Icon name="user" size={18} />
            </Link>
          )}
        </nav>
      </dialog>
    </header>
  );
}
