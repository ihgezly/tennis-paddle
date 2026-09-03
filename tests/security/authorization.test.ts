import { describe, it, expect } from "vitest";

const canReadOrder = (user: any, order: any) => {
  if (user.role === "admin") return true;
  return order.customerId === user.id;
};

describe("Authorization Rules", () => {
  it("customer can only read own order", () => {
    const user = { id: 1, role: "customer" };
    expect(canReadOrder(user, { id: 10, customerId: 1 })).toBe(true);
    expect(canReadOrder(user, { id: 11, customerId: 2 })).toBe(false);
  });

  it("admin can read all orders", () => {
    const admin = { id: 99, role: "admin" };
    expect(canReadOrder(admin, { id: 10, customerId: 1 })).toBe(true);
  });
});
