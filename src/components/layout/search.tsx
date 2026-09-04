"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import type { Media, Product } from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { RoutePath } from "@/lib/core/types/types";

const maxResults = 5;

export default function Search({ products }: { products: Product[] }) {
  const t = useTranslations("general");

  const rootRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return products.slice(0, maxResults);
    }

    return products
      .map((p) => {
        const title = p.title.toLowerCase();
        const slug = p.slug.toLowerCase();
        const price = String(p.priceInUSD);

        let score = 0;

        if (title === q) score = 100;
        else if (title.startsWith(q)) score = 80;
        else if (title.includes(q)) score = 60;

        if (slug.includes(q)) score += 40;
        if (price.includes(q)) score += 20;

        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title))
      .slice(0, maxResults)
      .map((x) => x.p);
  }, [products, query]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    setOpen(Boolean(query.trim()));
  }, [query]);

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative" onFocus={() => setOpen(true)}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          aria-expanded={open}
          aria-controls="search-results"
          role="combobox"
          className="
            w-full rounded-xl border px-4 py-3 pr-10 text-sm outline-none
            bg-background text-foreground border-border placeholder:text-text-muted
            focus:border-gold focus:ring-2 focus:ring-gold/20
          "
        />

        <div className="absolute inset-y-0 right-3 flex items-center">
          {open ? (
            <button
              type="button"
              aria-label={t("clear")}
              className="text-text-muted hover:text-foreground hover:cursor-pointer"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
            >
              <FiX className="h-5 w-5" />
            </button>
          ) : (
            <FiSearch className="h-5 w-5 text-text-muted" />
          )}
        </div>
      </div>

      {open ? (
        <div
          className="
            absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border shadow-lg
            border-border bg-surface
            max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2
            max-md:w-[min(calc(100vw-2rem),28rem)]
          "
        >
          <div className="px-4 py-2 text-xs font-semibold text-text-secondary">
            {t("products")}
          </div>

          <div className="max-h-[22rem] overflow-auto">
            {results.length > 0 ? (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/${RoutePath.product}/${product.slug}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="
                    flex items-center gap-3 px-4 py-3
                    hover:bg-surface-2 transition-colors
                  "
                >
                  <div
                    className="
                      h-10 w-10 overflow-hidden rounded-lg border
                      border-border bg-surface-2
                    "
                  >
                    <ImageVideo resource={product.image as Media} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {product.title}
                    </div>
                  </div>

                  <div className="shrink-0 text-sm font-semibold text-gold">
                    <Price amount={product.priceInUSD!} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-3 text-sm text-text-secondary">
                {t("noMatch")}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}