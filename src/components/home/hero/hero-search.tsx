"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) {
      router.push(`/categories?q=${encodeURIComponent(term)}`);
    } else {
      router.push("/categories");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto w-full max-w-md lg:mx-0"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث عن مضرب، حذاء، ماركة..."
        className="h-14 w-full rounded-full border border-border bg-surface px-5 pe-14 text-sm text-foreground outline-none transition-all placeholder:text-text-muted focus:border-gold focus:shadow-[0_0_0_3px_rgba(215,181,109,0.15)]"
      />
      <button
        type="submit"
        aria-label="بحث"
        className="absolute end-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black transition hover:bg-gold/85"
        style={{ boxShadow: "0 0 18px rgba(215,181,109,0.35)" }}
      >
        <FiSearch className="h-4 w-4" />
      </button>
    </form>
  );
}