import { z } from "zod";

export const sellRequestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.union([z.string(), z.number()]),
  brand: z.string().trim().max(80).optional(),
  description: z.string().trim().min(10).max(2000),
  conditionType: z.union([z.string(), z.number()]),
  conditionGrade: z.union([z.string(), z.number()]).optional(),
  askingPrice: z.number().finite().nonnegative().max(10_000_000),
  currencyCode: z.enum(["EGP", "USD"]).default("EGP"),
  images: z.array(z.object({ image: z.union([z.string(), z.number()]) })).min(5),
});

export type SellRequestInput = z.infer<typeof sellRequestSchema>;

export const paymobInitiateSchema = z.object({
  cartId: z.union([z.string(), z.number()]),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/),
  email: z.string().trim().email(),
});

export type PaymobInitiateInput = z.infer<typeof paymobInitiateSchema>;

export const paymobWebhookTransactionSchema = z.object({
  id: z.union([z.string(), z.number()]),
  success: z.boolean(),
  amount_cents: z.number().int(),
  currency: z.string(),
  order: z.object({
    id: z.union([z.string(), z.number()]),
    merchant_order_id: z.string().optional(),
  }),
  hmac: z.string().optional(),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
}