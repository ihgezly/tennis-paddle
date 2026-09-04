# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shopping.spec.ts >> browse categories
- Location: tests/e2e/shopping.spec.ts:3:1

# Error details

```
Error: page.goto: Could not connect to localhost: Connection refused
Call log:
  - navigating to "http://localhost:3344/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("browse categories", async ({ page }) => {
> 4  |   await page.goto("/");
     |              ^ Error: page.goto: Could not connect to localhost: Connection refused
  5  |   await page.click("text=Categories");
  6  |   await expect(page).toHaveURL(/categories/);
  7  | });
  8  | 
  9  | test("product detail page", async ({ page }) => {
  10 |   await page.goto("/categories");
  11 |   await page.click("text=View Product");
  12 |   await expect(page.locator("h1")).toBeVisible();
  13 | });
  14 | 
```