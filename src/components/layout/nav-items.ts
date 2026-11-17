export type UserRole = "ADMIN" | "OWNER" | "RENTER";

export interface NavLinkItem {
  readonly label: string;
  readonly href: string;
  readonly badge?: string;
  readonly description?: string;
}

export const ROLE_NAVIGATION: Record<UserRole, readonly NavLinkItem[]> = {
  RENTER: [
    { label: "Tìm thiết bị", href: "/items", description: "Duyệt và tìm kiếm thiết bị cần thuê" },
    { label: "Đơn thuê của tôi", href: "/bookings", description: "Theo dõi trạng thái đơn thuê và cọc" },
    { label: "Khiếu nại", href: "/claims", description: "Lịch sử khiếu nại và biên bản bàn giao" },
  ],
  OWNER: [
    { label: "Thiết bị của tôi", href: "/my-items", description: "Quản lý kho đồ và lịch rảnh" },
    { label: "Yêu cầu thuê", href: "/requests", badge: "Mới", description: "Duyệt hoặc từ chối các yêu cầu thuê" },
    { label: "+ Đăng tin mới", href: "/items/new", description: "Đăng thiết bị mới lên sàn" },
  ],
  ADMIN: [
    { label: "Người dùng", href: "/admin/users", description: "Quản lý và khóa/mở tài khoản" },
    { label: "Danh mục & Checklist", href: "/admin/categories", description: "Cấu hình danh mục và mẫu kiểm tra đồ" },
    { label: "Phân xử khiếu nại", href: "/admin/disputes", description: "Xem xét biên bản và xử lý cọc" },
    { label: "Nhật ký hệ thống", href: "/admin/audit-logs", description: "Audit trail bất biến" },
  ],
} as const;

export const PUBLIC_NAVIGATION: readonly NavLinkItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Khám phá thiết bị", href: "/items" },
  { label: "Quy trình & Cọc", href: "/#how-it-works" },
] as const;
