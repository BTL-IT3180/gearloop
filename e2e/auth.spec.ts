import { expect, test } from "@playwright/test";

test("shows the common error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("missing@gearloop.local");
  await page.getByLabel("Mật khẩu").fill("incorrect");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.locator("form [role=alert]")).toHaveText("Thông tin đăng nhập không đúng.");
  await expect(page.getByText(/không tồn tại/i)).toHaveCount(0);
});

test("signs in with the database role and signs out", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mai@gearloop.local");
  await page.getByLabel("Mật khẩu").fill("demo123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("Mai — máy ảnh · Chủ thiết bị")).toBeVisible();

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
});
