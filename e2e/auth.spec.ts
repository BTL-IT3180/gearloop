import { expect, test } from "@playwright/test";

test("shows the common error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("missing@gearloop.local");
  await page.getByLabel("Mật khẩu").fill("incorrect");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.locator("form [role=alert]")).toHaveText("Thông tin đăng nhập không đúng.");
  await expect(page.getByText(/không tồn tại/i)).toHaveCount(0);
});

test("signs in with the database role and an eight-hour session, then signs out", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mai@gearloop.local");
  await page.getByLabel("Mật khẩu").fill("demo123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("Mai — máy ảnh · Chủ thiết bị")).toBeVisible();

  const sessionResponse = await page.request.get("/api/auth/session");
  expect(sessionResponse.status()).toBe(200);
  expect((await sessionResponse.json()).user.role).toBe("OWNER");

  const sessionCookie = (await context.cookies()).find(({ name }) =>
    name === "authjs.session-token" || name === "__Secure-authjs.session-token",
  );
  expect(sessionCookie).toBeDefined();
  expect(sessionCookie?.httpOnly).toBe(true);
  const lifetimeSeconds = (sessionCookie?.expires ?? 0) - Date.now() / 1000;
  expect(lifetimeSeconds).toBeGreaterThan(8 * 60 * 60 - 60);
  expect(lifetimeSeconds).toBeLessThanOrEqual(8 * 60 * 60 + 60);

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
});
