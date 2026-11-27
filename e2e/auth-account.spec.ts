import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

async function submitLogin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

for (const [email, role] of [
  ["an@gearloop.local", "RENTER"],
  ["admin@gearloop.local", "ADMIN"],
]) {
  test("signs in with the seeded " + role + " role", async ({ page }) => {
    await submitLogin(page, email, "demo123");
    await expect(page).toHaveURL("/");

    const session = await page.request.get("/api/auth/session");
    expect(session.ok()).toBe(true);
    expect((await session.json()).user).toMatchObject({ email, role });
  });
}

test("reports an account lock only after the correct password and never starts a session", async ({ page }) => {
  const prisma = new PrismaClient();
  const email = randomUUID() + "@example.test";
  const password = randomUUID();
  const passwordHash = await bcrypt.hash(password, 4);
  try {
    const account = await prisma.user.create({
      data: { email, fullName: "Playwright locked account", passwordHash, isActive: false },
      select: { id: true },
    });
    try {
      for (const [attempt, message] of [
        ["incorrect", "Thông tin đăng nhập không đúng."],
        [password, "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên."],
      ]) {
        await submitLogin(page, email, attempt);
        await expect(page.locator("form [role=alert]")).toHaveText(message);

        const session = await page.request.get("/api/auth/session");
        expect(session.ok()).toBe(true);
        expect((await session.json())?.user).toBeUndefined();
      }
    } finally {
      await prisma.user.delete({ where: { id: account.id } });
    }
  } finally {
    await prisma.$disconnect();
  }
});
