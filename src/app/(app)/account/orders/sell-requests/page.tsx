// src/app/(app)/account/orders/sell-requests/page.tsx
import { getTranslations } from "next-intl/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function AccountSellRequestsPage() {
  const t = await getTranslations("sell");
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token")?.value;
  if (!token) return <div>Please login</div>;

  const payload = await getPayload({ config: configPromise });
  const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET || "") as {
    id: string;
  };
  const userId = decoded.id;

  const requests = await payload.find({
    collection: "sell-requests",
    where: { customer: { equals: userId } },
    sort: "-createdAt",
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
      {requests.docs.length === 0 ? (
        <p>No sell requests yet</p>
      ) : (
        <div className="space-y-4">
          {requests.docs.map((req: any) => (
            <div key={req.id} className="border rounded-lg p-4">
              <p>{req.title}</p>
              <p>Status: {req.status}</p>
              <p>
                Asking Price: {req.askingPrice} {req.currencyCode}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}