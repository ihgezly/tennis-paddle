# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sell-request.spec.ts >> submit sell request
- Location: tests/e2e/sell-request.spec.ts:3:1

# Error details

```
Error: page.goto: Could not connect to localhost: Connection refused
Call log:
  - navigating to "http://localhost:3344/sell", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("submit sell request", async ({ page }) => {
> 4  |   await page.goto("/sell");
     |              ^ Error: page.goto: Could not connect to localhost: Connection refused
  5  |   await page.fill('input[name="title"]', "Babolat Racket");
  6  |   await page.fill('textarea[name="description"]', "Good condition");
  7  |   await page.fill('input[name="askingPrice"]', "5000");
  8  |   await page.setInputFiles('input[type="file"]', ["tests/fixtures/img1.jpg", "tests/fixtures/img2.jpg", "tests/fixtures/img3.jpg", "tests/fixtures/img4.jpg", "tests/fixtures/img5.jpg"]);
  9  |   await page.click('button[type="submit"]');
  10 |   await expect(page).toHaveURL(/sell-requests/);
  11 | });
  12 | 
```