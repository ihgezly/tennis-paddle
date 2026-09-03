import { describe, it, expect } from "vitest";

function validateOrderAccess(user: any, orderId: number, orders: any[]) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (user.role === "admin") return true;
  return order.customerId === user.id;
}

describe("IDOR Protection", () => {
  const orders = [
    { id: 1, customerId: 100 },
    { id: 2, customerId: 200 },
  ];

  it("prevents access to other's order", () => {
    const user = { id: 100, role: "customer" };
    expect(validateOrderAccess(user, 1, orders)).toBe(true);
    expect(validateOrderAccess(user, 2, orders)).toBe(false);
  });
});
