# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shopping.spec.ts >> product detail page
- Location: tests/e2e/shopping.spec.ts:9:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3344/categories
Call log:
  - navigating to "http://localhost:3344/categories", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("browse categories", async ({ page }) => {
  4  |   await page.goto("/");
  5  |   await page.click("text=Categories");
  6  |   await expect(page).toHaveURL(/categories/);
  7  | });
  8  | 
  9  | test("product detail page", async ({ page }) => {
> 10 |   await page.goto("/categories");
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3344/categories
  11 |   await page.click("text=View Product");
  12 |   await expect(page.locator("h1")).toBeVisible();
  13 | });
  14 | 
```