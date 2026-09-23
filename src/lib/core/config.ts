type AppLocale = "ar" | "en";

type LocaleConfig = {
  lang: AppLocale;
  dir: "ltr" | "rtl";
  locale: "ar-EG" | "en-US";
  isRtl: boolean;
  currency: "EGP";
};

const LOCALE_CONFIG: Record<AppLocale, LocaleConfig> = {
  ar: { lang: "ar", dir: "rtl", locale: "ar-EG", isRtl: true, currency: "EGP" },
  en: { lang: "en", dir: "ltr", locale: "en-US", isRtl: false, currency: "EGP" },
};

const stripToDigits = (v: string) => (v || "").replace(/\D/g, "");

export type AppConfig = {
  SITE_NAME: string;
  BASE_URL: string;
  SERVER_URL: string;
  BLOB_URL?: string;
  BLOB_TOKEN: string;
  BUCKET_PREFIX: string;
  LOCAL: LocaleConfig;
  DATABASE_URL: string;
  PREVIEW_SECRET: string;
  PAYLOAD_SECRET: string;

  PAYMENT_ENABLED: boolean;
  SHIPPING_ENABLED: boolean;

  WHATSAPP_NUMBER: string;
  WHATSAPP_MESSAGE: string;
  CONTACT_PHONE: string;
  CONTACT_EMAIL: string;

  // ✅ Google Forms
  SELL_FORM_URL: string;
  CUSTOM_FORM_URL: string;

  // ✅ Phase 7 — Quick Order
  PAYMENT_INSTRUCTIONS: string;
  ORDER_THANK_YOU_MESSAGE: string;

  SEND_EMAIL_WHATSAPP: boolean;
  EMAIL_FROM_ADDRESS: string;
  EMAIL_SMTP_HOST: string;
  EMAIL_SMTP_PORT: number;
  EMAIL_SMTP_USER: string;
  EMAIL_SMTP_PASS: string;

  CALLMEBOT_API_KEY: string;
  WHATSAPP_NUMBER_ADMIN: string;

  PAYMOB_API_KEY: string;
  PAYMOB_INTEGRATION_ID: string;
  PAYMOB_IFRAME_ID: string;
  PAYMOB_HMAC_SECRET: string;

  SHIPPING_PROVIDER: "dummy" | "bosta" | "aramex" | "jt";
  BOSTA_API_KEY: string;
  ARAMEX_USERNAME: string;
  ARAMEX_PASSWORD: string;
  ARAMEX_ACCOUNT_NUMBER: string;
  JT_API_KEY: string;
  JT_BASE_URL: string;

  GOOGLE_SITE_VERIFICATION?: string;
  GOOGLE_ANALYTICS?: string;
  GOOGLE_ADS?: string;
  TIKTOK_PIXEL?: string;
  META_PIXEL?: string;
};

const truthy = (v: string | undefined) => v === "true" || v === "1";

export const appConfig: AppConfig = {
  SITE_NAME: (process.env.NEXT_PUBLIC_SITE_NAME ||
    "Paddle & Tennis Store") as string,
  BASE_URL: (process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3344") as string,
  SERVER_URL: (process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3344") as string,
  LOCAL: LOCALE_CONFIG[
    (process.env.NEXT_PUBLIC_LANG as AppLocale) ?? "ar"
  ] as LocaleConfig,
  DATABASE_URL: process.env.DATABASE_URL as string,
  BLOB_TOKEN: (process.env.BLOB_TOKEN || "") as string,
  BUCKET_PREFIX: process.env.BUCKET_PREFIX ?? "paddle_tennis_store",
  BLOB_URL: process.env.NEXT_PUBLIC_BLOB_URL,
  PREVIEW_SECRET: (process.env.PREVIEW_SECRET || "") as string,
  PAYLOAD_SECRET: (process.env.PAYLOAD_SECRET || "") as string,

  PAYMENT_ENABLED: truthy(process.env.NEXT_PUBLIC_PAYMENT_ENABLED),
  SHIPPING_ENABLED: truthy(process.env.NEXT_PUBLIC_SHIPPING_ENABLED),

  WHATSAPP_NUMBER: stripToDigits(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  ),
  WHATSAPP_MESSAGE: (
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "مرحبا، أريد تأكيد طلبي"
  ).trim(),
  CONTACT_PHONE: (process.env.NEXT_PUBLIC_CONTACT_PHONE || "").trim(),
  CONTACT_EMAIL: (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim(),

  // ✅ Google Forms
  SELL_FORM_URL: (process.env.NEXT_PUBLIC_SELL_FORM_URL || "").trim(),
  CUSTOM_FORM_URL: (process.env.NEXT_PUBLIC_CUSTOM_FORM_URL || "").trim(),

  // ✅ Phase 7 — Quick Order
  PAYMENT_INSTRUCTIONS: (
    process.env.NEXT_PUBLIC_PAYMENT_INSTRUCTIONS ||
    "💳 الدفع عند الاستلام أو تحويل بنكي — تواصل معنا على واتساب لتأكيد طلبك."
  ).trim(),

  ORDER_THANK_YOU_MESSAGE: (
    process.env.NEXT_PUBLIC_ORDER_THANK_YOU_MESSAGE ||
    "شكراً لك! سنتواصل معك خلال 24 ساعة لتأكيد الطلب."
  ).trim(),

  SEND_EMAIL_WHATSAPP: truthy(process.env.SEND_EMAIL_WHATSAPP),
  EMAIL_FROM_ADDRESS: (process.env.EMAIL_FROM_ADDRESS || "") as string,
  EMAIL_SMTP_HOST: (process.env.EMAIL_SMTP_HOST || "") as string,
  EMAIL_SMTP_PORT: Number(process.env.EMAIL_SMTP_PORT || 587),
  EMAIL_SMTP_USER: (process.env.EMAIL_SMTP_USER || "") as string,
  EMAIL_SMTP_PASS: (process.env.EMAIL_SMTP_PASS || "") as string,

  CALLMEBOT_API_KEY: (process.env.CALLMEBOT_API_KEY || "") as string,
  WHATSAPP_NUMBER_ADMIN: stripToDigits(process.env.WHATSAPP_NUMBER || ""),

  PAYMOB_API_KEY: (process.env.PAYMOB_API_KEY || "") as string,
  PAYMOB_INTEGRATION_ID: (process.env.PAYMOB_INTEGRATION_ID || "") as string,
  PAYMOB_IFRAME_ID: (process.env.PAYMOB_IFRAME_ID || "") as string,
  PAYMOB_HMAC_SECRET: (process.env.PAYMOB_HMAC_SECRET || "") as string,

  SHIPPING_PROVIDER:
    (process.env.SHIPPING_PROVIDER as "dummy" | "bosta" | "aramex" | "jt") ??
    "dummy",
  BOSTA_API_KEY: (process.env.BOSTA_API_KEY || "") as string,
  ARAMEX_USERNAME: (process.env.ARAMEX_USERNAME || "") as string,
  ARAMEX_PASSWORD: (process.env.ARAMEX_PASSWORD || "") as string,
  ARAMEX_ACCOUNT_NUMBER: (process.env.ARAMEX_ACCOUNT_NUMBER || "") as string,
  JT_API_KEY: (process.env.JT_API_KEY || "") as string,
  JT_BASE_URL: (process.env.JT_BASE_URL || "") as string,

  GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
  GOOGLE_ADS: process.env.NEXT_PUBLIC_GOOGLE_ADS,
  TIKTOK_PIXEL: process.env.NEXT_PUBLIC_TIKTOK_PIXEL,
  META_PIXEL: process.env.NEXT_PUBLIC_META_PIXEL,
};

export default appConfig;