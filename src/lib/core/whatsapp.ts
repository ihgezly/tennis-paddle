import appConfig from "@/lib/core/config";

type OrderWhatsAppPayload = {
  orderId: string | number;
  customerName: string;
  customerPhone: string;
  amount: number;
  itemCount: number;
};

/**
 * يبني لينك WhatsApp للتواصل مع العميل
 * يدعم أرقام مصرية: 01xxxxxxxxx → 201xxxxxxxxx
 */
export function buildCustomerWhatsAppLink(
  customerPhone: string,
  message?: string,
): string | null {
  if (!customerPhone) return null;

  // نشيل كل حاجة غير الأرقام
  const cleaned = customerPhone.replace(/\D/g, "");

  // لو رقم مصري محلي: 01xxxxxxxxx → 201xxxxxxxxx
  let normalized = cleaned;
  if (cleaned.startsWith("0")) {
    normalized = "20" + cleaned.slice(1);
  }

  // لو رقم 10 أرقام يبدأ بـ 1 → نضيف 20
  if (cleaned.length === 10 && cleaned.startsWith("1")) {
    normalized = "20" + cleaned;
  }

  const defaultMsg = `مرحباً، بخصوص طلبك من ${appConfig.SITE_NAME}`;
  const text = encodeURIComponent(message || defaultMsg);

  return `https://wa.me/${normalized}?text=${text}`;
}

/**
 * يبني رسالة WhatsApp مع تفاصيل الطلب
 */
export function buildOrderMessage(payload: OrderWhatsAppPayload): string {
  return [
    `مرحباً ${payload.customerName} 👋`,
    "",
    `نتواصل معك بخصوص طلبك رقم #${payload.orderId}`,
    `عدد المنتجات: ${payload.itemCount}`,
    `الإجمالي: ${payload.amount} ج.م`,
    "",
    "للتأكيد والدفع، من فضلك رد على هذه الرسالة.",
    "",
    `— ${appConfig.SITE_NAME}`,
  ].join("\n");
}

/**
 * إرسال إشعار واتساب للأدمن عبر Callmebot
 * (يستخدم في OrderNotifier أو Cron)
 */
export async function sendAdminCallmebot(message: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const phone = appConfig.WHATSAPP_NUMBER_ADMIN;
  const apiKey = appConfig.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    return {
      success: false,
      error: "Callmebot not configured (missing phone or API key)",
    };
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(
    message,
  )}&apikey=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * إرسال إشعار Callmebot عند وصول طلب جديد
 */
export async function notifyAdminNewOrder(payload: OrderWhatsAppPayload) {
  const msg = [
    "🛒 طلب جديد وصل",
    "",
    `#${payload.orderId} — ${payload.customerName}`,
    `📱 ${payload.customerPhone}`,
    `💰 ${payload.amount} ج.م`,
    "",
    `👉 ${appConfig.BASE_URL}/admin/collections/orders/${payload.orderId}`,
  ].join("\n");

  return sendAdminCallmebot(msg);
}

/**
 * اختبار Callmebot — يستخدمه الأدمن من الـDashboard
 */
export async function testCallmebot() {
  const testMessage = `✅ اختبار ناجح — ${appConfig.SITE_NAME}\n${new Date().toLocaleString(
    "ar-EG",
  )}`;
  return sendAdminCallmebot(testMessage);
}