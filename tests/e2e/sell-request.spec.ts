import { test, expect } from "@playwright/test";

test("submit sell request", async ({ page }) => {
  await page.goto("/sell");
  await page.fill('input[name="title"]', "Babolat Racket");
  await page.fill('textarea[name="description"]', "Good condition");
  await page.fill('input[name="askingPrice"]', "5000");
  await page.setInputFiles('input[type="file"]', ["tests/fixtures/img1.jpg", "tests/fixtures/img2.jpg", "tests/fixtures/img3.jpg", "tests/fixtures/img4.jpg", "tests/fixtures/img5.jpg"]);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/sell-requests/);
});
