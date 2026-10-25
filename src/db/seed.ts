/**
 * Seed dữ liệu mẫu GearLoop (GL-109).
 * Idempotent: xoá sạch theo thứ tự FK rồi nạp lại — chạy được lúc boot Docker
 * và chạy lại bao nhiêu lần cũng cho cùng một trạng thái.
 * Mật khẩu mọi tài khoản demo: demo123 (hash bcrypt — ADR-002).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo123";
const CALENDAR_DAYS_AHEAD = 60;

/** Ngày theo UTC, tránh lệch múi giờ khi so với @db.Date. */
function dayFromToday(offsetDays: number): Date {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

async function wipe() {
  // Thứ tự xoá: bảng con → bảng cha.
  await prisma.depositLedger.deleteMany();
  await prisma.damageClaim.deleteMany();
  await prisma.conditionReportEntry.deleteMany();
  await prisma.conditionReport.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.calendarDay.deleteMany();
  await prisma.rateTier.deleteMany();
  await prisma.depositPolicy.deleteMany();
  await prisma.itemPhoto.deleteMany();
  await prisma.item.deleteMany();
  await prisma.checklistTemplateItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.policySetting.deleteMany();
}

async function main() {
  console.log("→ Xoá dữ liệu cũ ...");
  await wipe();

  console.log("→ Tạo PolicySetting ...");
  await prisma.policySetting.createMany({
    data: [
      {
        key: "claim_window_hours",
        value: "48",
        note: "Sau 48h kể từ RETURNED mà không có claim → hệ thống tự nhả cọc",
      },
      {
        key: "deposit_cap_percent",
        value: "50",
        note: "% tối đa của giá trị thay thế mà DepositPolicy được đặt",
      },
      {
        key: "suspension_threshold",
        value: "3",
        note: "Số lần vi phạm trong 30 ngày trước khi tự khoá tài khoản",
      },
    ],
  });

  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  console.log("→ Tạo users (mật khẩu demo: demo123) ...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@gearloop.local",
      passwordHash: hash,
      fullName: "Quản trị viên",
      role: "ADMIN",
    },
  });
  const mai = await prisma.user.create({
    data: {
      email: "mai@gearloop.local",
      passwordHash: hash,
      fullName: "Mai — máy ảnh",
      role: "SELLER",
    },
  });
  const lan = await prisma.user.create({
    data: {
      email: "lan@gearloop.local",
      passwordHash: hash,
      fullName: "Lan — đồ cắm trại",
      role: "SELLER",
    },
  });
  for (const [email, name] of [
    ["an@gearloop.local", "Nguyễn Văn An"],
    ["linh@gearloop.local", "Trần Thị Linh"],
    ["huy@gearloop.local", "Lê Văn Huy"],
  ] as const) {
    await prisma.user.create({
      data: { email, passwordHash: hash, fullName: name, role: "BUYER" },
    });
  }

  console.log("→ Tạo categories + checklist ...");
  const camera = await prisma.category.create({
    data: {
      name: "Máy ảnh & Quay phim",
      description: "Body, lens, máy quay, phụ kiện ánh sáng",
      checklistItems: {
        create: [
          { label: "Cảm biến không bụi bẩn" },
          { label: "Ống kính rõ nét, không nứt" },
          { label: "Pin và sạc đầy đủ" },
          { label: "Nút bấm/đuôi xoáy hoạt động" },
          { label: "Tình trạng vỏ ngoài" },
        ],
      },
    },
  });
  const tools = await prisma.category.create({
    data: {
      name: "Dụng cụ & Sửa chữa",
      description: "Máy khoan, cầm tay, thang, dụng cụ sửa nhà",
      checklistItems: {
        create: [
          { label: "Pin giữ điện tốt" },
          { label: "Lưỡi/khuôn còn dùng được" },
          { label: "Dây điện và case đầy đủ" },
          { label: "Tình trạng vỏ ngoài" },
        ],
      },
    },
  });
  const outdoor = await prisma.category.create({
    data: {
      name: "Cắm trại & Ngoài trời",
      description: "Lều, bếp, túi ngủ, đèn trại",
      checklistItems: {
        create: [
          { label: "Vải lều không rách" },
          { label: "Khóa kéo trơn" },
          { label: "Cột và cọc chắc chắn" },
          { label: "Không ẩm mốc, không mùi" },
        ],
      },
    },
  });

  console.log("→ Tạo items + giá theo ngày + tiền cọc + lịch 60 ngày ...");
  type SeedItem = {
    owner: number;
    category: number;
    title: string;
    description: string;
    replacement: number;
    depositPercent: number;
    tiers: { minDays: number; maxDays: number | null; price: number }[];
    photos: string[];
  };
  const items: SeedItem[] = [
    {
      owner: mai.id,
      category: camera.id,
      title: "Máy ảnh Sony A7 III + lens 28-70mm",
      description:
        "Full-frame cho thuê theo ngày. Kèm 2 pin, sạc, thẻ 64GB, túi chống sốc.",
      replacement: 55_000_000,
      depositPercent: 35,
      tiers: [
        { minDays: 1, maxDays: 2, price: 250_000 },
        { minDays: 3, maxDays: 6, price: 200_000 },
        { minDays: 7, maxDays: 30, price: 150_000 },
      ],
      photos: [
        "https://picsum.photos/seed/gearloop-sony-1/800/600",
        "https://picsum.photos/seed/gearloop-sony-2/800/600",
      ],
    },
    {
      owner: mai.id,
      category: camera.id,
      title: "Máy quay DJI Osmo Pocket 3",
      description: "Gimbal cầm tay 4K, kèm pin sạc rời và túi đựng.",
      replacement: 28_000_000,
      depositPercent: 35,
      tiers: [
        { minDays: 1, maxDays: 2, price: 180_000 },
        { minDays: 3, maxDays: 6, price: 150_000 },
      ],
      photos: ["https://picsum.photos/seed/gearloop-dji-1/800/600"],
    },
    {
      owner: lan.id,
      category: outdoor.id,
      title: "Lều cắm trại 4 người",
      description: "Lều 2 lớp chống nước, kèm cọc và bạt lót.",
      replacement: 3_500_000,
      depositPercent: 30,
      tiers: [
        { minDays: 1, maxDays: 2, price: 120_000 },
        { minDays: 3, maxDays: 6, price: 90_000 },
      ],
      photos: ["https://picsum.photos/seed/gearloop-tent-1/800/600"],
    },
    {
      owner: lan.id,
      category: tools.id,
      title: "Bếp du lịch + bình gas mini",
      description: "Bếp ga cắm trại 2 đầu, kèm 2 bình gas rỗng.",
      replacement: 1_200_000,
      depositPercent: 30,
      tiers: [{ minDays: 1, maxDays: 3, price: 70_000 }],
      photos: ["https://picsum.photos/seed/gearloop-stove-1/800/600"],
    },
  ];

  let dayCount = 0;
  for (const it of items) {
    const created = await prisma.item.create({
      data: {
        ownerId: it.owner,
        categoryId: it.category,
        title: it.title,
        description: it.description,
        replacementValueVnd: it.replacement,
      },
    });
    await prisma.itemPhoto.createMany({
      data: it.photos.map((url, i) => ({
        itemId: created.id,
        url,
        isBaseline: i === 0,
      })),
    });
    await prisma.rateTier.createMany({
      data: it.tiers.map((t) => ({
        itemId: created.id,
        minDays: t.minDays,
        maxDays: t.maxDays,
        pricePerDayVnd: t.price,
      })),
    });
    await prisma.depositPolicy.create({
      data: { itemId: created.id, percent: it.depositPercent },
    });
    await prisma.calendarDay.createMany({
      data: Array.from({ length: CALENDAR_DAYS_AHEAD }, (_, i) => ({
        itemId: created.id,
        date: dayFromToday(i),
        kind: "FREE" as const,
      })),
    });
    dayCount += CALENDAR_DAYS_AHEAD;
  }

  console.log(
    `\n✔ Seed xong: 6 users (1 admin, 2 sellers, 3 buyers), 3 categories, ` +
      `${items.length} items, ${dayCount} calendar days, 3 PolicySettings. ` +
      `Admin: ${admin.email} / demo123`,
  );
}

main()
  .catch((e) => {
    console.error("Seed thất bại:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
