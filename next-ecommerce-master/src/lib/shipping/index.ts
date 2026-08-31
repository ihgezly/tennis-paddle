import { DummyShippingProvider } from "@/lib/shipping/dummy-provider";
import { JTShippingProvider } from "@/lib/shipping/jt-provider";
import type { ShippingProvider } from "@/lib/shipping/types";
import appConfig from "@/lib/core/config";

export type { ShippingProvider, CreateShipmentInput, CreateShipmentResult, ShipmentStatus, ShippingAddress } from "@/lib/shipping/types";

export function getShippingProvider(): ShippingProvider {
  switch (appConfig.SHIPPING_PROVIDER) {
    case "jt":
      return new JTShippingProvider(appConfig.JT_API_KEY, appConfig.JT_BASE_URL);
    case "dummy":
    default:
      return new DummyShippingProvider();
  }
}