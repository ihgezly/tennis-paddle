import configPromise from "@payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const t = await getTranslations("account.orders");
  const headersList = await headers();

  const payload = await getPayload({ config: configPromise });
  const user = await payload.auth({
    headers: headersList,
    req: {
      headers: headersList,
    } as any,
  });

  if (!user?.user) {
    return <div>{t("unauthorized")}</div>;
  }

  const orders = await payload.find({
    collection: "orders",
    where: {
      customer: { equals: (user.user as any).id },
    },
    sort: "-createdAt",
  });

  return (
    <div>
      <h1>{t("title")}</h1>
      {orders.docs.length === 0 ? (
        <p>{t("empty")}</p>
      ) : (
        <ul>
          {orders.docs.map((order: any) => (
            <li key={order.id}>
              {t("orderNo")} {order.orderNumber} - {order.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}