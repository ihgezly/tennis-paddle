import { describe, it, expect } from "vitest";

async function simulateConcurrentCheckout(stock: number, users: number) {
  let available = stock;
  let success = 0;
  let fail = 0;
  await Promise.all(
    Array.from({ length: users }, async () => {
      await new Promise((r) => setTimeout(r, Math.random() * 10));
      if (available > 0) {
        available--;
        success++;
      } else {
        fail++;
      }
    }),
  );
  return { success, fail, available };
}

describe("Concurrent Checkout", () => {
  it("only one succeeds when stock is 1 and 100 users", async () => {
    const result = await simulateConcurrentCheckout(1, 100);
    expect(result.success).toBe(1);
    expect(result.fail).toBe(99);
    expect(result.available).toBe(0);
  });
});
