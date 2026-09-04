import configPromise from "@payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function SellRequestsPage() {
  const t = await getTranslations("account.sellRequests");
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

  const sellRequests = await payload.find({
    collection: "sell-requests",
    where: {
      customer: { equals: (user.user as any).id },
    },
    sort: "-createdAt",
  });

  return (
    <div>
      <h1>{t("title")}</h1>
      {sellRequests.docs.length === 0 ? (
        <p>{t("empty")}</p>
      ) : (
        <ul>
          {sellRequests.docs.map((request: any) => (
            <li key={request.id}>
              {t("requestNo")} {request.id} - {request.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}