import { describe, it, expect } from "vitest";

export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("INVALID_AMOUNT");
  return Math.round(amount * 100);
}

export function fromMinorUnits(minor: number): number {
  return minor / 100;
}

export function calculateLineTotal(price: number, quantity: number): number {
  if (!Number.isFinite(price) || price < 0) throw new Error("INVALID_PRICE");
  if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new Error("INVALID_QUANTITY");
  return toMinorUnits(price) * quantity;
}

describe("Money Utilities", () => {
  it("converts EGP to piastres", () => {
    expect(toMinorUnits(500)).toBe(50000);
    expect(toMinorUnits(0)).toBe(0);
    expect(toMinorUnits(1.5)).toBe(150);
  });

  it("rejects negative amount", () => {
    expect(() => toMinorUnits(-5)).toThrow("INVALID_AMOUNT");
  });

  it("calculates line total", () => {
    expect(calculateLineTotal(10, 2)).toBe(2000);
  });

  it("rejects negative quantity", () => {
    expect(() => calculateLineTotal(10, -1)).toThrow("INVALID_QUANTITY");
  });
});
