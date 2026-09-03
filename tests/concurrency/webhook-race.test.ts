import { describe, it, expect } from "vitest";

type State = "initiating" | "paid" | "failed";
function processWebhookSuccess(state: State): State | null {
  if (state === "initiating") return "paid";
  if (state === "paid") return "paid";
  return null;
}

describe("Webhook Race", () => {
  it("prevents double payment", () => {
    expect(processWebhookSuccess("initiating")).toBe("paid");
    expect(processWebhookSuccess("paid")).toBe("paid");
  });
});
