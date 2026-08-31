import { getTranslations } from "next-intl/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function AccountOrdersPage() {
  const t = await getTranslations("checkout.page");
  const token = cookies().get("payload-token")?.value;
  if (!token) return <div>Please login</div>;

  const payload = await getPayload({ config: configPromise });
  const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET || "") as { id: string };
  const userId = decoded.id;

  const orders = await payload.find({
    collection: "orders",
    where: { customer: { equals: userId } },
    sort: "-createdAt",
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
      {orders.docs.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.docs.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <p>Order #{order.id}</p>
              <p>Status: {order.status}</p>
              <p>Total: {order.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}