import { test, expect } from "@playwright/test";

test("browse categories", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Categories");
  await expect(page).toHaveURL(/categories/);
});

test("product detail page", async ({ page }) => {
  await page.goto("/categories");
  await page.click("text=View Product");
  await expect(page.locator("h1")).toBeVisible();
});
