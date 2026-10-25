const roles = [
  {
    name: "Người thuê (Buyer)",
    points: [
      "Tìm thiết bị trống đúng khung ngày cần dùng",
      "Tiền cọc được giữ trong sổ cọc, tự nhả khi trả đủ",
      "Khiếu nại hư hỏng có chứng cứ 2 đầu (nhận – trả)",
    ],
  },
  {
    name: "Chủ thiết bị (Seller)",
    points: [
      "Cho đồ nhàn rỗi sinh lời theo bảng giá theo ngày",
      "Lịch đặt không thể chồng — chặn ngay ở database",
      "Chốt tình trạng máy lúc nhận/tra bằng checklist",
    ],
  },
  {
    name: "Quản trị (Admin)",
    points: [
      "Quản lý danh mục và checklist theo từng nhóm thiết bị",
      "Giải quyết khiếu nại dựa trên so sánh 2 biên bản",
      "Toàn bộ thao tác ghi vào audit log, không sửa được",
    ],
  },
];

const steps = [
  "Chủ tin đăng lên thiết bị kèm bảng giá theo ngày và % tiền cọc",
  "Người thuê chọn khung ngày trống, đặt lịch — cọc được giữ lại",
  "Hai bên xác nhận tình trạng máy bằng checklist lúc nhận và lúc trả",
  "Trả đủ thì cọc tự nhả; có hư hỏng thì Admin xét biên bản",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Thuê thiết bị, đừng mua hẳn.
        </h1>
        <p className="text-slate-600 max-w-2xl">
          GearLoop là sàn cho thuê thiết bị ngang hàng: máy ảnh, dụng cụ, đồ
          cắm trại. Mỗi lượt thuê là một khung ngày có người sở hữu, một khoản
          cọc có sổ sách và một cặp biên bản tình trạng.
        </p>
      </section>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        {roles.map((r) => (
          <div
            key={r.name}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-semibold mb-3">{r.name}</h2>
            <ul className="text-sm text-slate-600 space-y-2">
              {r.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Cách hoạt động</h2>
        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
