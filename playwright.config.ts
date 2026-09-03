import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3344",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    { name: "Desktop Chrome", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "Mobile Safari", use: { browserName: "webkit", viewport: { width: 390, height: 844 } } },
  ],
});
