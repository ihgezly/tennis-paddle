"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SellEquipmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const next = [...images, ...files].slice(0, 10);
    if (next.length < 5) setError("Please upload at least 5 images.");
    else setError(null);
    setImages(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length < 5) { setError("Please upload at least 5 images."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const imageIds: number[] = [];
      for (const file of images) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("alt", file.name);
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Failed to upload image");
        imageIds.push((await res.json()).doc.id);
      }
      const formData = new FormData(e.currentTarget);
      const payload = {
        title: formData.get("title"),
        category: formData.get("category"),
        brand: formData.get("brand") || undefined,
        description: formData.get("description"),
        conditionType: formData.get("conditionType"),
        conditionGrade: formData.get("conditionGrade") || undefined,
        askingPrice: Number(formData.get("askingPrice")),
        currencyCode: "EGP",
        images: imageIds.map(id => ({ image: id })),
      };
      const res = await fetch("/api/sell-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to submit");
      toast.success("Sell request submitted!");
      router.push("/account/sell-requests");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm font-medium">Product title *</label><input name="title" required minLength={3} maxLength={120} className="w-full rounded-md border px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Category *</label><input name="category" required placeholder="e.g. padel-rackets" className="w-full rounded-md border px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Brand</label><input name="brand" maxLength={80} className="w-full rounded-md border px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Condition type *</label><select name="conditionType" required className="w-full rounded-md border px-3 py-2"><option value="new">New</option><option value="used">Used</option></select></div>
        <div><label className="mb-1 block text-sm font-medium">Condition grade</label><select name="conditionGrade" className="w-full rounded-md border px-3 py-2"><option value="">Select grade</option><option value="like_new">Like New</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option></select></div>
        <div><label className="mb-1 block text-sm font-medium">Asking price (EGP) *</label><input name="askingPrice" type="number" required min={0} step="1" className="w-full rounded-md border px-3 py-2" /></div>
      </div>
      <div><label className="mb-1 block text-sm font-medium">Description *</label><textarea name="description" required minLength={10} maxLength={2000} rows={4} className="w-full rounded-md border px-3 py-2" /></div>
      <div><label className="mb-1 block text-sm font-medium">Photos (minimum 5) *</label><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} className="w-full rounded-md border px-3 py-2" /><p className="mt-1 text-xs">{images.length} image(s) selected (max 10)</p></div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={isSubmitting || images.length < 5} className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit Sell Request"}</button>
    </form>
  );
}