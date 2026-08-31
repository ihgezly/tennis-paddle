import { createHmac } from "crypto";

const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

type PaymobConfig = { apiKey: string; integrationId: string; iframeId: string; hmacSecret: string };

function getPaymobConfig(): PaymobConfig {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  const iframeId = process.env.PAYMOB_IFRAME_ID;
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!apiKey || !integrationId || !iframeId || !hmacSecret) {
    throw new Error("Paymob is not configured. Set PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET.");
  }
  return { apiKey, integrationId, iframeId, hmacSecret };
}

type BillingData = {
  first_name: string; last_name: string; email: string; phone_number: string;
  apartment?: string; floor?: string; street?: string; building?: string; city?: string; country?: string; state?: string;
};

async function paymobFetch<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${PAYMOB_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Paymob request to ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

async function getAuthToken(): Promise<string> {
  const { apiKey } = getPaymobConfig();
  const data = await paymobFetch<{ token: string }>("/auth/tokens", { api_key: apiKey });
  return data.token;
}

async function registerOrder(params: { authToken: string; merchantOrderId: string; amountCents: number; currency: string; items: Array<{name:string; amount_cents:number; quantity:number}> }): Promise<{ id: number }> {
  return paymobFetch<{ id: number }>("/ecommerce/orders", {
    auth_token: params.authToken,
    delivery_needed: false,
    amount_cents: params.amountCents,
    currency: params.currency,
    merchant_order_id: params.merchantOrderId,
    items: params.items,
  });
}

async function requestPaymentKey(params: { authToken: string; amountCents: number; currency: string; orderId: number; billingData: BillingData }): Promise<{ token: string }> {
  const { integrationId } = getPaymobConfig();
  return paymobFetch<{ token: string }>("/acceptance/payment_keys", {
    auth_token: params.authToken,
    amount_cents: params.amountCents,
    expiration: 3600,
    order_id: params.orderId,
    billing_data: {
      apartment: "NA", floor: "NA", street: "NA", building: "NA", city: "NA", country: "EG", state: "NA",
      ...params.billingData,
    },
    currency: params.currency,
    integration_id: Number(integrationId),
  });
}

export function buildIframeUrl(paymentToken: string): string {
  const { iframeId } = getPaymobConfig();
  return `${PAYMOB_BASE_URL}/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
}

export async function initiatePaymobPayment(params: { merchantOrderId: string; amountCents: number; currency: string; billingData: BillingData; items: Array<{name:string; amount_cents:number; quantity:number}> }) {
  const authToken = await getAuthToken();
  const order = await registerOrder({ authToken, merchantOrderId: params.merchantOrderId, amountCents: params.amountCents, currency: params.currency, items: params.items });
  const paymentKey = await requestPaymentKey({ authToken, amountCents: params.amountCents, currency: params.currency, orderId: order.id, billingData: params.billingData });
  return { paymobOrderId: order.id, iframeUrl: buildIframeUrl(paymentKey.token) };
}

const TRANSACTION_HMAC_FIELDS = [
  "amount_cents","created_at","currency","error_occured","has_parent_transaction","id","integration_id","is_3d_secure","is_auth","is_capture","is_refunded","is_standalone_payment","is_voided","order.id","owner","pending","source_data.pan","source_data.sub_type","source_data.type","success",
] as const;

const getPath = (obj: Record<string, unknown>, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);

export function verifyPaymobTransactionHmac(transaction: Record<string, unknown>, receivedHmac: string | null | undefined): boolean {
  if (!receivedHmac) return false;
  const { hmacSecret } = getPaymobConfig();
  const concatenated = TRANSACTION_HMAC_FIELDS.map((field) => {
    const value = getPath(transaction, field);
    return value === undefined || value === null ? "" : String(value);
  }).join("");
  const computed = createHmac("sha512", hmacSecret).update(concatenated).digest("hex");
  if (computed.length !== receivedHmac.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ receivedHmac.charCodeAt(i);
  return diff === 0;
}

export const paymobCentsFromAmount = (amount: number): number => Math.round(amount * 100);