import { describe, it, expect } from "vitest";

function processEvent(eventId: string, processed: Set<string>) {
  if (processed.has(eventId)) return false;
  processed.add(eventId);
  return true;
}

describe("Webhook Idempotency", () => {
  it("processes event only once", () => {
    const processed = new Set<string>();
    expect(processEvent("evt_1", processed)).toBe(true);
    expect(processEvent("evt_1", processed)).toBe(false);
    expect(processed.size).toBe(1);
  });
});
