import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
      "tests/security/**/*.test.ts",
      "tests/concurrency/**/*.test.ts",
    ],
    exclude: ["node_modules/**", ".next/**", "tests/e2e/**"],
    coverage: {
      reporter: ["text", "html", "json-summary"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "tests/**",
        "seed/**",
        "src/lib/core/types/payload-types.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@payload-config": path.resolve(__dirname, "./src/payload.config.ts"),
    },
  },
});
