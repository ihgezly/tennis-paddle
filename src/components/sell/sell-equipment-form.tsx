"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { toast } from "sonner";

import appConfig from "@/lib/core/config";

const FIELD_CLASS =
  "w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted transition focus:border-volt focus:outline-none focus:ring-2 focus:ring-volt/20";

export default function SellEquipmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ⚠️ كل الـhooks فوق أي return
  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

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
        phone: formData.get("phone"),
        description: formData.get("description"),
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