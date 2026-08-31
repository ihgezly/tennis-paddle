import type { ShippingProvider, CreateShipmentInput, CreateShipmentResult, ShipmentStatus } from "@/lib/shipping/types";

export class JTShippingProvider implements ShippingProvider {
  readonly name = "jt";
  constructor(private readonly apiKey: string, private readonly baseUrl: string) {}
  async createShipment(_input: CreateShipmentInput): Promise<CreateShipmentResult> {
    // TODO: Implement J&T API when credentials available.
    throw new Error("JTShippingProvider.createShipment is not implemented yet.");
  }
  async cancelShipment(_providerReference: string): Promise<void> {
    throw new Error("JTShippingProvider.cancelShipment is not implemented yet.");
  }
  async getStatus(_providerReference: string): Promise<ShipmentStatus> {
    throw new Error("JTShippingProvider.getStatus is not implemented yet.");
  }
}