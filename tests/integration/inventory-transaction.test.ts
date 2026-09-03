import { describe, it, expect, vi } from "vitest";
import { reserveInventory, InsufficientStockError } from "@/lib/core/inventory";

describe("Inventory Reservation (Integration)", () => {
  it("reserves inventory and writes movements", async () => {
    const tx = {
      execute: vi.fn((query) => {
        if (String(query).includes("UPDATE")) return { rows: [{ id: 1, inventory: 9 }], rowCount: 1 };
        return { rows: [{ id: 1 }], rowCount: 1 };
      }),
    };

    await expect(reserveInventory(tx as any, [{ product: 1, quantity: 1 }], 100, new Date(Date.now() + 60000))).resolves.toBeUndefined();
    expect(tx.execute).toHaveBeenCalled();
  });

  it("rejects reservation when insufficient stock", async () => {
    const tx = { execute: vi.fn(() => ({ rows: [], rowCount: 0 })) };
    await expect(reserveInventory(tx as any, [{ product: 1, quantity: 5 }], 101, new Date())).rejects.toThrowError(InsufficientStockError);
  });
});
