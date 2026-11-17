import { expect, test } from "@playwright/test";

test("searches categories and recovers from no results", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Tìm danh mục thiết bị" })
    .fill("máy ảnh");
  await page.getByRole("button", { name: "Tìm danh mục", exact: true }).click();
  await expect(page.locator(".category-card")).toHaveCount(1);
  await expect(page.locator(".category-card h3")).toHaveText(
    "Máy ảnh & quay phim",
  );
  await page
    .getByRole("searchbox", { name: "Tìm danh mục thiết bị" })
    .fill("khôngcókếtquả");
  await page.getByRole("button", { name: "Tìm danh mục", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Chưa tìm thấy danh mục phù hợp" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Xem tất cả danh mục", exact: true })
    .last()
    .click();
  await expect(page.locator(".category-card")).toHaveCount(3);
});

test("ignores role preview cookies without a real login", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "gearloop_preview_role",
      value: "ADMIN",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/");
  await page.getByRole("button", { name: "Khám phá", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Khám phá cùng GearLoop" }),
  ).toBeVisible();
  await expect(
    page.getByText("Phân xử khiếu nại", { exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("mobile navigation is usable without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Đăng nhập", exact: true })
    .click();
  await expect(page).toHaveURL("/login");
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
});

test("toggles password visibility and keeps credentials after a rejected login", async ({
  page,
}) => {
  await page.goto("/login");
  const password = page.getByLabel("Mật khẩu", { exact: true });
  await page
    .getByLabel("Email", { exact: true })
    .fill("missing@gearloop.local");
  await password.fill("incorrect");
  await page
    .getByRole("button", { name: "Hiện mật khẩu", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ẩn mật khẩu", exact: true }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    "missing@gearloop.local",
  );
  await expect(password).toHaveValue("incorrect");
});

test("signs out from the mobile drawer and clears the real session", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("mai@gearloop.local");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("demo123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .locator(".upcoming-link")
      .filter({ hasText: "Thiết bị của tôi" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Đăng xuất", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(page.locator(".account-identity")).toHaveCount(0);
  expect(await (await page.request.get("/api/auth/session")).json()).toBeNull();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

for (const account of [
  { email: "admin@gearloop.local", role: "Quản trị", menu: "Người dùng" },
  {
    email: "mai@gearloop.local",
    role: "Chủ thiết bị",
    menu: "Thiết bị của tôi",
  },
  { email: "an@gearloop.local", role: "Người thuê", menu: "Đơn thuê của tôi" },
]) {
  test(
    "uses the real session in the shell for " + account.role,
    async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Email", { exact: true }).fill(account.email);
      await page.getByLabel("Mật khẩu", { exact: true }).fill("demo123");
      await page
        .getByRole("button", { name: "Đăng nhập", exact: true })
        .click();
      await expect(page).toHaveURL("/");
      await expect(page.locator(".account-identity")).toContainText(
        account.role,
      );
      await page.getByRole("button", { name: "Khám phá", exact: true }).click();
      await expect(
        page
          .getByRole("dialog")
          .locator(".upcoming-link")
          .filter({ hasText: account.menu }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Đăng xuất", exact: true })
        .click();
      await expect(page).toHaveURL("/");
      await expect(page.getByRole("link", { name: /Đăng nhập/ })).toBeVisible();
      expect(
        await (await page.request.get("/api/auth/session")).json(),
      ).toBeNull();
    },
  );
}

test("returns a real 404 and offers a working way home", async ({ page }) => {
  const response = await page.goto("/page-that-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Trang bạn tìm không có ở đây." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Về trang chủ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Thuê thiết bị, đừng mua hẳn." }),
  ).toBeVisible();
});
