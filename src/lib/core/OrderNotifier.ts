import type { Media, Order, Product } from "@/lib/core/types/payload-types";
import type { Payload } from "payload";

import appConfig from "@/lib/core/config";
import { type OrderItem, CollectionName } from "@/lib/core/types/types";
import { formatPrice, resolveMediaUrl } from "@/lib/core/util";
import { messages } from "@/lib/intl/request";

type EmailItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string;
  imageAlt: string;
};

export class OrderNotifier {
  constructor(private readonly payload: Payload) {}

  async send(order: Order) {
    await Promise.allSettled([
      this.sendCustomerEmail(order),
      this.sendAdminEmail(order),
      this.sendWhatsappAdmin(Number(order.id)),
    ]);
  }

  private async sendCustomerEmail(order: Order) {
    if (!order.email) return;
    const emailItems = await this.buildEmailItems(order);
    const html = this.generateOrderEmailHtml(order, emailItems);

    try {
      await this.payload.sendEmail({
        to: order.email,
        subject: `${messages.order_notifier.email.subjectPrefix}${order.id}`,
        html,
      });
    } catch (error) {
      console.error(`❌ Order email failed #${order.id}`, error);
    }
  }

  private async sendAdminEmail(order: Order) {
    const adminEmail = appConfig.CONTACT_EMAIL;
    if (!adminEmail) return;

    const lines = (order.items || [])
      .map(
        (item: any) =>
          `• ${item.title} × ${item.quantity} = ${formatPrice(item.lineTotal)}`,
      )
      .join("\n");

    const html = `
<div dir="${appConfig.LOCAL.dir}" style="font-family: sans-serif; padding: 16px; max-width: 600px;">
  <h2>🛒 طلب جديد #${order.id}</h2>
  <p><strong>الاسم:</strong> ${order.name}</p>
  <p><strong>الموبايل:</strong> ${order.phone}</p>
  <p><strong>الإيميل:</strong> ${order.email}</p>
  <hr />
  <pre style="font-size: 14px; line-height: 1.6;">${lines}</pre>
  <hr />
  <p><strong>الإجمالي:</strong> ${formatPrice(order.amount ?? 0)}</p>
  <p><a href="${appConfig.BASE_URL}/admin/collections/orders/${order.id}">افتح الطلب في الأدمن →</a></p>
</div>`;

    try {
      await this.payload.sendEmail({
        to: adminEmail,
        subject: `🛒 طلب جديد #${order.id} - ${order.name}`,
        html,
      });
    } catch (error) {
      console.error(`❌ Admin email failed #${order.id}`, error);
    }
  }

  private async sendWhatsappAdmin(orderId: number) {
    const phone = appConfig.WHATSAPP_NUMBER_ADMIN;
    const apiKey = appConfig.CALLMEBOT_API_KEY;

    if (!phone || !apiKey) {
      console.warn("WhatsApp admin notification skipped: missing config");
      return;
    }

    const text = `${messages.order_notifier.whatsappAdmin}${appConfig.BASE_URL}/admin/collections/orders/${orderId}`;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;

    try {
      await fetch(url, { method: "GET" });
    } catch (error) {
      console.error(`❌ WhatsApp admin failed #${orderId}`, error);
    }
  }

  private async buildEmailItems(order: Order): Promise<EmailItem[]> {
    const items = (order.items || []) as OrderItem[];
    if (!items.length) return [];

    const productIds = Array.from(
      new Set(
        items
          .map((i) =>
            typeof i.product === "number"
              ? i.product
              : i.product && typeof i.product === "object"
                ? Number((i.product as Product).id)
                : undefined,
          )
          .filter((x): x is number => typeof x === "number"),
      ),
    );

    const productsRes = await this.payload.find({
      collection: CollectionName.products,
      depth: 1,
      limit: 0,
      pagination: false,
      where: { id: { in: productIds } },
      select: { id: true, image: true },
    });

    const productById = new Map(
      productsRes.docs.map((p) => [Number(p.id), p]),
    );

    return items
      .map((item) => {
        const productId =
          typeof item.product === "number"
            ? item.product
            : item.product && typeof item.product === "object"
              ? Number((item.product as Product).id)
              : undefined;

        if (typeof productId !== "number") return null;

        const product = productById.get(productId) as Product;
        if (!product) return null;

        const media = product.image as Media;

        return {
          title: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          imageUrl: resolveMediaUrl(media),
          imageAlt: media.alt,
        } satisfies EmailItem;
      })
      .filter((x): x is EmailItem => Boolean(x));
  }

  private generateOrderEmailHtml(order: Order, emailItems: EmailItem[]) {
    const itemsHtml = emailItems
      .map(
        (item) => `
<tr style="border-bottom: 1px solid #ddd; text-align: center;">
  <td style="padding: 8px;">
    <img src="${item.imageUrl}" alt="${item.imageAlt}" width="50" height="50" style="border-radius: 4px; object-fit: cover;" />
  </td>
  <td style="padding: 8px;">${item.title}</td>
  <td style="padding: 8px;">${item.quantity}</td>
  <td style="padding: 8px;">${formatPrice(item.unitPrice)}</td>
  <td style="padding: 8px;"><strong>${formatPrice(item.lineTotal)}</strong></td>
</tr>`,
      )
      .join("");

    return `
<div dir="${appConfig.LOCAL.dir}" style="font-family: sans-serif; padding: 10px; max-width: 600px; margin: auto;">
  <h2 style="margin-bottom: 10px;">
    ${messages.order_notifier.email.greeting} ${order.name},
  </h2>
  <p style="margin: 0 0 20px 0;">
    ${messages.order_notifier.email.confirmation}
  </p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead style="background-color: #f5f5f5;">
      <tr style="text-align: center;">
        <th style="padding: 10px;">${messages.order_notifier.email.headers.image}</th>
        <th style="padding: 10px;">${messages.order_notifier.email.headers.product}</th>
        <th style="padding: 10px;">${messages.order_notifier.email.headers.quantity}</th>
        <th style="padding: 10px;">${messages.order_notifier.email.headers.price}</th>
        <th style="padding: 10px;">${messages.order_notifier.email.headers.total}</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <h3 style="margin-top: 20px;">
    ${messages.order_notifier.email.total} ${formatPrice(order.amount ?? 0)}
  </h3>
  <p>${messages.order_notifier.email.orderNumber} <strong>#${order.id}</strong></p>
  <p>${messages.order_notifier.email.thanks}</p>
</div>`;
  }
}