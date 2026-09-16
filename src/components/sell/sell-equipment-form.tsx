"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { toast } from "sonner";

import appConfig from "@/lib/core/config";

type Category = { id: number; title: string; slug: string };
type ConditionType = {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  requiresGrade?: boolean;
};
type ConditionGrade = {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  conditionType: number | { id: number };
};

const FIELD_CLASS =
  "w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted transition focus:border-volt focus:outline-none focus:ring-2 focus:ring-volt/20";

export default function SellEquipmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [conditionTypes, setConditionTypes] = useState<ConditionType[]>([]);
  const [conditionGrades, setConditionGrades] = useState<ConditionGrade[]>([]);
  const [selectedConditionType, setSelectedConditionType] = useState<
    number | ""
  >("");
  const [loadingMeta, setLoadingMeta] = useState(true);

  // ⚠️ كل الـhooks فوق أي return
  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, ctRes, cgRes] = await Promise.all([
          fetch(
            `${appConfig.SERVER_URL}/api/category?where[_status][equals]=published&limit=200`,
            { credentials: "include" },
          ),
          fetch(`${appConfig.SERVER_URL}/api/condition-types?limit=50`, {
            credentials: "include",
          }),
          fetch(`${appConfig.SERVER_URL}/api/condition-grades?limit=50`, {
            credentials: "include",
          }),
        ]);

        const catData = await catRes.json();
        const ctData = await ctRes.json();
        const cgData = await cgRes.json();

        setCategories(catData.docs ?? []);
        setConditionTypes(
          (ctData.docs ?? []).filter((c: any) => c.isActive !== false),
        );
        setConditionGrades(
          (cgData.docs ?? []).filter((g: any) => g.isActive !== false),
        );
      } catch {
        setError("فشل تحميل البيانات الأساسية");
      } finally {
        setLoadingMeta(false);
      }
    };
    load();
  }, []);

  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const gradesForType = conditionGrades.filter((g) => {
    const tId =
      typeof g.conditionType === "object" ? g.conditionType.id : g.conditionType;
    return tId === selectedConditionType;
  });

  const requiresGrade =
    conditionTypes.find((c) => c.id === selectedConditionType)?.requiresGrade ??
    false;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const next = [...images, ...files].slice(0, 10);
    setError(next.length < 5 ? "الرجاء رفع 5 صور على الأقل" : null);
    setImages(next);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length < 5) {
      setError("الرجاء رفع 5 صور على الأقل");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const imageIds: number[] = [];
      for (const file of images) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("alt", file.name);
        const res = await fetch(`${appConfig.SERVER_URL}/api/media`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (res.status === 401) {
          throw new Error("يجب تسجيل الدخول لإتمام عملية البيع");
        }
        if (!res.ok) throw new Error("فشل رفع الصور");
        const data = await res.json();
        imageIds.push(data.doc.id);
      }

      const formData = new FormData(e.currentTarget);
      const payload = {
        title: formData.get("title"),
        category: Number(formData.get("category")),
        brand: formData.get("brand") || undefined,
        phone: formData.get("phone"),
        description: formData.get("description"),
        conditionType: Number(formData.get("conditionType")),
        conditionGrade: formData.get("conditionGrade")
          ? Number(formData.get("conditionGrade"))
          : undefined,
        askingPrice: Number(formData.get("askingPrice")),
        currencyCode: "EGP",
        images: imageIds.map((id) => ({ image: id })),
      };

      const res = await fetch(`${appConfig.SERVER_URL}/api/sell-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        throw new Error("يجب تسجيل الدخول لإتمام عملية البيع");
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "فشل إرسال الطلب");
      }

      toast.success("تم إرسال طلب البيع بنجاح!");
      router.push("/account/orders/sell-requests");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ⚠️ الـreturn الشرطي بعد كل الـhooks
  if (loadingMeta) {
    return (
      <div className="py-20 text-center text-text-secondary">
        جاري التحميل...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-10 rounded-2xl border border-border bg-surface p-6 md:p-10"
    >
      {/* ═══ بيانات المنتج ═══ */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-volt">
          بيانات المنتج
        </h2>

        <div>
          <label className="mb-2 block text-sm font-medium">
            اسم المنتج *
          </label>
          <input
            name="title"
            required
            minLength={3}
            maxLength={120}
            className={FIELD_CLASS}
            placeholder="مثال: مضرب بادل Bullpadel Vertex"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">القسم *</label>
            <select
              name="category"
              required
              className={FIELD_CLASS}
              defaultValue=""
            >
              <option value="">اختر القسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">الماركة</label>
            <input
              name="brand"
              maxLength={80}
              className={FIELD_CLASS}
              placeholder="اختياري"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            رقم الهاتف *
          </label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="+201234567890"
            pattern="^\+?[0-9]{7,15}$"
            className={FIELD_CLASS + " mono-num"}
            dir="ltr"
          />
        </div>
      </section>

      {/* ═══ الحالة ═══ */}
      <section className="flex flex-col gap-5 border-t border-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-volt">
          الحالة
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              نوع الحالة *
            </label>
            <select
              name="conditionType"
              required
              value={selectedConditionType}
              onChange={(e) =>
                setSelectedConditionType(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className={FIELD_CLASS}
            >
              <option value="">اختر الحالة</option>
              {conditionTypes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr || c.nameEn || c.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              تصنيف الحالة {requiresGrade ? "*" : ""}
            </label>
            <select
              name="conditionGrade"
              required={requiresGrade}
              disabled={!requiresGrade}
              className={FIELD_CLASS + " disabled:opacity-50"}
            >
              <option value="">اختر التصنيف</option>
              {gradesForType.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameAr || g.nameEn || g.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ═══ السعر والوصف ═══ */}
      <section className="flex flex-col gap-5 border-t border-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-volt">
          السعر والوصف
        </h2>

        <div>
          <label className="mb-2 block text-sm font-medium">
            السعر المطلوب (جنيه) *
          </label>
          <input
            name="askingPrice"
            type="number"
            required
            min={0}
            step="1"
            className={FIELD_CLASS + " mono-num"}
            dir="ltr"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">الوصف *</label>
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className={FIELD_CLASS}
            placeholder="اكتب تفاصيل الحالة، سنة الشراء، وأي عيوب إن وجدت..."
          />
        </div>
      </section>

      {/* ═══ الصور ═══ */}
      <section className="flex flex-col gap-5 border-t border-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-volt">
          الصور (5 على الأقل) *
        </h2>

        <label
          htmlFor="sell-images"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface-2 px-4 py-10 text-center transition hover:border-volt/50"
        >
          <FiUploadCloud className="h-7 w-7 text-text-muted" />
          <span className="text-sm text-text-secondary">
            اضغط لرفع الصور — {images.length}/10
          </span>
          <input
            id="sell-images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {previews.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {previews.map((p, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="حذف الصورة"
                  className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || images.length < 5}
        className="volt-cta w-full rounded-full py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "جاري الإرسال..." : "إرسال طلب البيع"}
      </button>

      {/* Google Form Fallback */}
      {process.env.NEXT_PUBLIC_SELL_FORM_URL ? (
        <p className="text-center text-sm text-text-secondary">
          عندك مشكلة في الفورم؟{" "}
          <a
            href={process.env.NEXT_PUBLIC_SELL_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-volt underline underline-offset-4"
          >
            استخدم نموذج Google
          </a>
        </p>
      ) : null}
    </form>
  );
}