import { describe, it, expect } from "vitest";
import { canTransitionPayment, assertPaymentTransition } from "@/lib/core/payment-state-machine";
import { PaymentStatus } from "@/lib/core/types/types";

describe("Payment State Machine", () => {
  it("allows valid transitions", () => {
    expect(canTransitionPayment(PaymentStatus.PENDING, PaymentStatus.INITIATING)).toBe(true);
    expect(canTransitionPayment(PaymentStatus.INITIATING, PaymentStatus.PAID)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionPayment(PaymentStatus.PAID, PaymentStatus.FAILED)).toBe(false);
    expect(canTransitionPayment(PaymentStatus.FAILED, PaymentStatus.PAID)).toBe(false);
    expect(canTransitionPayment(PaymentStatus.EXPIRED, PaymentStatus.PAID)).toBe(false);
  });

  it("asserts transition without throwing for valid", () => {
    expect(() => assertPaymentTransition(PaymentStatus.PENDING, PaymentStatus.INITIATING)).not.toThrow();
  });

  it("asserts transition throws for invalid", () => {
    expect(() => assertPaymentTransition(PaymentStatus.PAID, PaymentStatus.FAILED)).toThrow();
  });
});
