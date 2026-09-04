import type {
  ShippingProvider,
  CreateShipmentResult,
  ShipmentStatus,
} from "@/lib/shipping/types";

export class JTShippingProvider implements ShippingProvider {
  readonly name = "jt";

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  async createShipment(): Promise<CreateShipmentResult> {
    throw new Error("JTShippingProvider.createShipment is not implemented yet.");
  }

  async cancelShipment(): Promise<void> {
    throw new Error("JTShippingProvider.cancelShipment is not implemented yet.");
  }

  async getStatus(): Promise<ShipmentStatus> {
    throw new Error("JTShippingProvider.getStatus is not implemented yet.");
  }
}