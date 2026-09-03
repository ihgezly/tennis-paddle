import { describe, it, expect } from "vitest";
import { sellRequestSchema, paymobInitiateSchema } from "@/lib/core/validation";

describe("Validation Schemas", () => {
  it("validates sell request correctly", () => {
    const valid = sellRequestSchema.safeParse({
      title: "Babolat Racket",
      category: 1,
      description: "Good condition",
      conditionType: 2,
      askingPrice: 1500,
      images: Array(5).fill({ image: 1 }),
    });
    expect(valid.success).toBe(true);
  });

  it("rejects insufficient images", () => {
    const invalid = sellRequestSchema.safeParse({
      title: "Racket",
      category: 1,
      description: "Good",
      conditionType: 2,
      askingPrice: 100,
      images: [{ image: 1 }],
    });
    expect(invalid.success).toBe(false);
  });

  it("validates Paymob initiate", () => {
    const valid = paymobInitiateSchema.safeParse({
      cartId: 1,
      name: "Ahmed",
      phone: "01012345678",
      email: "ahmed@example.com",
    });
    expect(valid.success).toBe(true);
  });
});
