# GearLoop — Hướng dẫn sử dụng

## Cách 1 — Chạy trên GitHub Codespaces (khuyên dùng)
Không cần cài Docker/Node/PostgreSQL trên máy — mọi thứ chạy trên trình duyệt.

### Bước 1: Đăng nhập GitHub
1. Vào [github.com](https://github.com) → **Sign in**.
2. Mở repo: `https://github.com/BTL-IT3180/gearloop`.

### Bước 2: Tạo Codespace
1. Bấm nút xanh **Code** → tab **Codespaces** → **Create codespace on main**.
2. Đợi trình duyệt mở cửa sổ VS Code trên web.

### Bước 3: Chạy ứng dụng
Trong terminal của Codespace:
```bash
docker compose up --build
```
Đợi log hiện `Ready`.

### Bước 4: Mở ứng dụng
Codespace tự phát hiện cổng `4300` → bấm **Open in Browser**.
Nếu bỏ lỡ: tab **PORTS** → dòng `4300` → biểu tượng địa cầu.

> **Chia sẻ link cho bạn cùng lớp xem:** tab **PORTS** → chuột phải dòng `4300`
> → **Port Visibility** → **Public**.
>
> **Đóng Codespace khi xong** (tiết kiệm giờ miễn phí):
> [github.com/codespaces](https://github.com/codespaces) → **Stop codespace**.

## Cách 2 — Chạy trên máy local bằng Docker
Cần **Docker Desktop** đang chạy.

```bash
git clone git@github.com:BTL-IT3180/gearloop.git
cd gearloop
docker compose up --build
```
Mở **http://localhost:4300**. App tự migrate + seed lần đầu chạy.

| Dịch vụ | Cổng |
|---|---|
| Ứng dụng | `4300` |
| PostgreSQL | `55432` |

```bash
docker compose up -d          # chạy nền
docker compose logs -f app    # xem log
docker compose down           # dừng (giữ dữ liệu)
docker compose down -v        # dừng + xoá sạch
```

## Cách 3 — Chạy Node trực tiếp (khi đang sửa code)
Cần Node.js 20+ và PostgreSQL đang chạy (có thể chỉ bật DB của Docker):
```bash
docker compose up -d db       # chỉ bật database
npm install
cp .env.example .env          # giữ nguyên DATABASE_URL mặc định
npx prisma db push            # đồng bộ schema
npm run db:seed               # dữ liệu mẫu
npm run dev                   # http://localhost:3000
```

## Tài khoản demo (mật khẩu: `demo123`)
| Email | Vai trò |
|---|---|
| `admin@gearloop.local` | Quản trị (Admin) |
| `mai@gearloop.local` | Chủ thiết bị (Seller) |
| `an@gearloop.local` | Người thuê (Buyer) |

*(Còn: `lan@` — seller; `linh@`, `huy@` — buyer.)*

## (Tuỳ chọn) Chạy test
Cần PostgreSQL ở `localhost:55432` (bật bằng `docker compose up -d db`), rồi:
```bash
npm install
npx prisma db push && npm run db:seed
npm test
```
`npm test` chạy vitest — kiểm tra schema, seed và ràng buộc chống đặt chồng.
Chi tiết: [`doc/regression-testing.md`](./doc/regression-testing.md).

> Lưu ý: nếu source đặt trong thư mục đồng bộ cloud (OneDrive/iCloud/Dropbox),
> filesystem chậm có thể làm `next dev` khởi động lâu — nên đặt project ở ổ thường.
