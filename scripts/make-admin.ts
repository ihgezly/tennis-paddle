import "dotenv/config";
import { getPayload } from "payload";

import config from "../src/payload.config";

const EMAIL = process.argv[2];

if (!EMAIL) {
  console.error("Usage: pnpm tsx scripts/make-admin.ts <email>");
  process.exit(1);
}

async function run() {
  const payload = await getPayload({ config });

  const res = await payload.find({
    collection: "users",
    where: { email: { equals: EMAIL } },
    limit: 1,
  });

  if (!res.docs.length) {
    console.error(`❌ مفيش user بالإيميل ${EMAIL}`);
    process.exit(1);
  }

  await payload.update({
    collection: "users",
    id: res.docs[0].id,
    data: { roles: ["admin"] } as any,
    overrideAccess: true,
  });

  console.log(`✅ ${EMAIL} بقى admin`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});