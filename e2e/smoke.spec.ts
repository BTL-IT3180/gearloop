import { expect, test } from "@playwright/test";

test("home page loads in a browser", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Thuê thiết bị, đừng mua hẳn." }),
  ).toBeVisible();
});
