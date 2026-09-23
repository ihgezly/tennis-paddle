import appConfig from "@/lib/core/config";

/**
 * يبني رسالة WhatsApp للعميل بعد تسجيل الطلب
 */
export function buildCustomerOrderWhatsAppLink(params: {
  customerPhone: string;
  orderId: string | number;
  productTitle: string;
  amount: number;
}): string | null {
  const { customerPhone, orderId, productTitle, amount } = params;

  if (!customerPhone) return null;

  // نشيل كل حاجة غير الأرقام
  const cleaned = customerPhone.replace(/\D/g, "");

  // لو رقم مصري محلي: 01xxxxxxxxx → 201xxxxxxxxx
  let normalized = cleaned;
  if (cleaned.startsWith("0")) {
    normalized = "20" + cleaned.slice(1);
  }
  if (cleaned.length === 10 && cleaned.startsWith("1")) {
    normalized = "20" + cleaned;
  }

  const message = [
    `مرحباً 👋`,
    "",
    `أنا عملت طلب رقم *#${orderId}*`,
    `المنتج: ${productTitle}`,
    `الإجمالي: ${amount} ج.م`,
    "",
    `عايز أكمل الدفع والتوصيل.`,
  ].join("\n");

  const text = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${text}`;
}

/**
 * نص وسائل الدفع (من env)
 */
export function getPaymentInstructions(): string {
  return appConfig.PAYMENT_INSTRUCTIONS;
}

/**
 * نص الشكر بعد الطلب
 */
export function getThankYouMessage(): string {
  return appConfig.ORDER_THANK_YOU_MESSAGE;
}

/**
 * يحوّل رقم موبايل لعرض موحد
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && cleaned.startsWith("1")) {
    return `0${cleaned}`;
  }
  return cleaned;
}

/**
 * Validation: يتحقق من رقم مصري
 */
export function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // 11 رقم يبدأ بـ 01
  if (cleaned.length === 11 && cleaned.startsWith("01")) return true;
  // 10 أرقام يبدأ بـ 1
  if (cleaned.length === 10 && cleaned.startsWith("1")) return true;
  // صيغة دولية +20
  if (cleaned.length === 12 && cleaned.startsWith("20")) return true;
  return false;
}