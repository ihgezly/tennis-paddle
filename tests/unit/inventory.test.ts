import { describe, it, expect } from "vitest";
import { resolveTargets, InvalidQuantityError } from "@/lib/core/inventory";

describe("Inventory resolveTargets", () => {
  it("rejects negative quantity", () => {
    expect(() => resolveTargets([{ product: 1, quantity: -5 }])).toThrowError(InvalidQuantityError);
  });

  it("rejects zero quantity", () => {
    expect(() => resolveTargets([{ product: 1, quantity: 0 }])).toThrowError(InvalidQuantityError);
  });

  it("rejects decimal quantity", () => {
    expect(() => resolveTargets([{ product: 1, quantity: 1.5 }])).toThrowError(InvalidQuantityError);
  });

  it("merges duplicate product entries", () => {
    const targets = resolveTargets([
      { product: 1, quantity: 2 },
      { product: 1, quantity: 3 },
    ]);
    expect(targets).toHaveLength(1);
    expect(targets[0].quantity).toBe(5);
  });

  it("separates different variants", () => {
    const targets = resolveTargets([
      { product: 1, variant: 10, quantity: 1 },
      { product: 1, variant: 11, quantity: 2 },
    ]);
    expect(targets).toHaveLength(2);
  });
});
