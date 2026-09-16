import "dotenv/config";
import { getPayload } from "payload";

import config from "../src/payload.config";

const ROOT_CATEGORIES = [
  { title: "Padel", slug: "padel", position: 1, description: "كل ما يخص البادل" },
  { title: "Tennis", slug: "tennis", position: 2, description: "كل ما يخص التنس" },
];

const PLACEHOLDER_URL =
  "https://placehold.co/600x600/0a0d10/d7b56d/png?text=Category";

async function ensurePlaceholderImage(payload: any): Promise<number> {
  // 1) ابحث عن أي صورة موجودة
  const existing = await payload.find({
    collection: "media",
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length) {
    console.log(`✅ فيه صورة موجودة بالفعل (ID: ${existing.docs[0].id})`);
    return existing.docs[0].id;
  }

  // 2) حمّل صورة افتراضية
  console.log("⏳ بحمّل صورة افتراضية...");
  const res = await fetch(PLACEHOLDER_URL);
  if (!res.ok) {
    throw new Error("فشل تحميل الصورة الافتراضية — تأكد من الإنترنت");
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const created = await payload.create({
    collection: "media",
    data: { alt: "Category placeholder" },
    file: {
      data: buf,
      mimetype: "image/png",
      name: "category-placeholder.png",
      size: buf.length,
    },
  });

  console.log(`✅ رفعت صورة افتراضية (ID: ${created.id})`);
  return created.id;
}

async function run() {
  const payload = await getPayload({ config });

  const fallbackImageId = await ensurePlaceholderImage(payload);

  for (const cat of ROOT_CATEGORIES) {
    const existing = await payload.find({
      collection: "category",
      where: { slug: { equals: cat.slug } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length) {
      console.log(`⏭️  "${cat.title}" موجود بالفعل — تم تخطيه`);
      continue;
    }

    await payload.create({
      collection: "category",
      data: {
        title: cat.title,
        slug: cat.slug,
        position: cat.position,
        image: fallbackImageId,
        description: {
          root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            direction: "rtl",
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                direction: "rtl",
                children: [
                  {
                    type: "text",
                    mode: "normal",
                    text: cat.description,
                    style: "",
                    detail: 0,
                    format: 0,
                    version: 1,
                  },
                ],
              },
            ],
          },
        },
        _status: "published",
        generateSlug: false,
      } as any,
    });
    console.log(`✅ أضفت "${cat.title}"`);
  }

  console.log("\n🎉 تم بنجاح");
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ خطأ:", e);
  process.exit(1);
});