import { expect, test, type Page } from "@playwright/test";

async function signInAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mai@gearloop.local");
  await page.getByLabel("Mật khẩu").fill("demo123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL("/");
}

for (const [scenario, email] of [
  ["unknown account", "missing@gearloop.local"],
  ["wrong password", "mai@gearloop.local"],
]) {
  test(`rejects ${scenario} with the same error and no session`, async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu").fill("incorrect");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.locator("form [role=alert]")).toHaveText("Thông tin đăng nhập không đúng.");

    const session = await page.request.get("/api/auth/session");
    expect(session.status()).toBe(200);
    expect((await session.json())?.user).toBeUndefined();
  });
}

test("signs in with the database role and an eight-hour session, then signs out", async ({ page, context }) => {
  await signInAsOwner(page);
  await expect(page.getByText("Mai — máy ảnh · Chủ thiết bị")).toBeVisible();

  const sessionResponse = await page.request.get("/api/auth/session");
  expect(sessionResponse.status()).toBe(200);
  const session = await sessionResponse.json();
  expect(session.user.role).toBe("OWNER");
  expect(session).not.toHaveProperty("logoutSessionId");

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

  const cookiesAfterLogout = await context.cookies();
  expect(cookiesAfterLogout.some(({ name }) => name === sessionCookie?.name)).toBe(false);

  const sessionAfterLogout = await page.request.get("/api/auth/session");
  expect(sessionAfterLogout.status()).toBe(200);
  expect((await sessionAfterLogout.json())?.user).toBeUndefined();
});

test("signs out through the Auth.js endpoint and leaves the other device signed in", async ({
  baseURL,
  browser,
  page,
}) => {
  await signInAsOwner(page);
  const otherDevice = await browser.newContext({ baseURL });

  try {
    const otherPage = await otherDevice.newPage();
    await signInAsOwner(otherPage);

    const csrf = await page.request.get("/api/auth/csrf");
    expect(csrf.ok()).toBe(true);
    const { csrfToken } = await csrf.json();
    expect(typeof csrfToken).toBe("string");
    const logout = await page.request.post("/api/auth/signout", {
      form: { csrfToken, callbackUrl: "/" },
      maxRedirects: 0,
    });
    expect(logout.status()).toBe(302);

    await page.reload();
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

    const currentSession = await page.request.get("/api/auth/session");
    expect(currentSession.ok()).toBe(true);
    expect((await currentSession.json())?.user).toBeUndefined();

    const otherSession = await otherPage.request.get("/api/auth/session");
    expect(otherSession.ok()).toBe(true);
    expect((await otherSession.json())?.user).toMatchObject({ role: "OWNER" });
  } finally {
    await otherDevice.close();
  }
});
