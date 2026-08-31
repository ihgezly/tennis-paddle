import type { ShippingProvider, CreateShipmentInput, CreateShipmentResult, ShipmentStatus } from "@/lib/shipping/types";

export class DummyShippingProvider implements ShippingProvider {
  readonly name = "dummy";
  async createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    const trackingNumber = `DUMMY-${input.orderId}-${Date.now()}`;
    return { trackingNumber, providerReference: trackingNumber };
  }
  async cancelShipment(_providerReference: string): Promise<void> {}
  async getStatus(_providerReference: string): Promise<ShipmentStatus> { return "in_transit"; }
}