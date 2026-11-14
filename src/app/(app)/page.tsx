import Link from "next/link";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardSkeleton,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui";

const roles = [
  {
    roleName: "RENTER" as const,
    name: "Người thuê (Renter)",
    badgeVariant: "success" as const,
    points: [
      "Tìm thiết bị trống đúng khung ngày cần dùng",
      "Tiền cọc được giữ trong sổ cọc, tự nhả khi trả đủ",
      "Khiếu nại hư hỏng có chứng cứ 2 đầu (nhận – trả)",
    ],
  },
  {
    roleName: "OWNER" as const,
    name: "Chủ thiết bị (Owner)",
    badgeVariant: "warning" as const,
    points: [
      "Cho đồ nhàn rỗi sinh lời theo bảng giá theo ngày",
      "Lịch đặt không thể chồng — chặn ngay ở database",
      "Chốt tình trạng máy lúc nhận/trả bằng checklist",
    ],
  },
  {
    roleName: "ADMIN" as const,
    name: "Quản trị (Admin)",
    badgeVariant: "info" as const,
    points: [
      "Quản lý danh mục và checklist theo từng nhóm thiết bị",
      "Giải quyết khiếu nại dựa trên so sánh 2 biên bản",
      "Toàn bộ thao tác ghi vào audit log, không sửa được",
    ],
  },
];

const steps = [
  {
    num: "1",
    title: "Đăng tin & Cấu hình cọc",
    desc: "Chủ thiết bị đăng tin kèm bảng giá theo ngày, checklist bàn giao và % tiền cọc.",
  },
  {
    num: "2",
    title: "Đặt lịch & Ký quỹ cọc",
    desc: "Người thuê chọn khung ngày rảnh, gửi yêu cầu; cọc được giữ an toàn trong sổ cọc minh bạch.",
  },
  {
    num: "3",
    title: "Checklist 2 đầu nhận – trả",
    desc: "Hai bên xác nhận tình trạng máy bằng checklist ảnh lúc nhận và lúc trả đồ.",
  },
  {
    num: "4",
    title: "Tự động nhả cọc / Phân xử",
    desc: "Hoàn tất suôn sẻ cọc tự hoàn trả 100%; có tranh chấp thì Admin xét duyệt theo biên bản đối chiếu.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 w-full space-y-12">
      {/* Hero Section */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="success" size="md">
            Sàn P2P minh bạch
          </Badge>
          <span className="text-xs text-slate-500 font-medium">Bảo vệ tiền cọc 2 chiều</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Thuê thiết bị, đừng mua hẳn.
        </h1>

        <p className="text-slate-600 max-w-2xl text-base leading-relaxed">
          GearLoop là sàn cho thuê thiết bị ngang hàng: máy ảnh, dụng cụ, đồ cắm trại.
          Mỗi lượt thuê là một khung ngày có người sở hữu, một khoản cọc có sổ sách
          và một cặp biên bản tình trạng đối chiếu rõ ràng.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/items">
            <Button variant="primary" size="lg">
              Khám phá thiết bị ngay
            </Button>
          </Link>
          <Link href="/items/new">
            <Button variant="outline" size="lg">
              Đăng tin cho thuê
            </Button>
          </Link>
        </div>
      </section>

      {/* 3 Roles Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Mô hình 3 vai trò (RBAC)
          </h2>
          <span className="text-xs text-slate-500">Chuẩn môn học IT3180</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {roles.map((r) => (
            <Card key={r.name} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={r.badgeVariant} size="sm">
                    {r.roleName}
                  </Badge>
                </div>
                <CardTitle className="text-base">{r.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2.5">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Cách hoạt động
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Card key={s.num} className="bg-slate-50/50 border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs mb-1">
                  {s.num}
                </div>
                <CardTitle className="text-sm">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed">
                  {s.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trạng thái EmptyState & Table primitive (E0-F3-T2) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Đơn thuê gần đây (Minh họa Table & EmptyState)
            </h2>
            <p className="text-xs text-slate-500">Khung bảng hiển thị trạng thái rỗng khi chưa có giao dịch</p>
          </div>
          <Badge variant="default" size="sm">
            Empty State Demo
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Thiết bị</TableHead>
              <TableHead>Khung ngày</TableHead>
              <TableHead>Tiền cọc</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <EmptyState
                  title="Chưa có lượt thuê nào"
                  description="Khi bạn đặt thuê thiết bị hoặc có khách thuê đồ của bạn, danh sách giao dịch sẽ hiển thị tại đây."
                  action={
                    <Link href="/items">
                      <Button variant="primary" size="sm">
                        Tìm thiết bị cần thuê
                      </Button>
                    </Link>
                  }
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* Preview Section: Skeletons (E0-F3-T3) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Thiết bị mới lên sàn
            </h2>
            <p className="text-xs text-slate-500">Khung tải trước cho tính năng tìm kiếm (Sprint 1)</p>
          </div>
          <Badge variant="default" size="sm">
            Skeleton Preview
          </Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </div>
  );
}
