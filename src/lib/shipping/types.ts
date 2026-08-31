export type ShippingAddress = { fullName: string; phone: string; addressLine1: string; addressLine2?: string; city: string; country: string };
export type CreateShipmentInput = { orderId: string; address: ShippingAddress; codAmount?: number; weightKg?: number; packageDescription?: string };
export type CreateShipmentResult = { trackingNumber: string; providerReference: string; labelUrl?: string };
export type ShipmentStatus = "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "returned" | "cancelled";

export interface ShippingProvider {
  readonly name: string;
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
  cancelShipment(providerReference: string): Promise<void>;
  getStatus(providerReference: string): Promise<ShipmentStatus>;
}