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

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark
        className="rounded-sm bg-gold/25 text-gold"
        style={{ padding: "0 1px" }}
      >
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
};

export default function Search({ products }: { products: Product[] }) {
  const t = useTranslations("general");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return products.slice(0, maxResults);

    return products
      .map((p) => {
        const title = p.title.toLowerCase();
        const slug = p.slug.toLowerCase();
        const price = String(
          (p as any).priceInEGP ?? p.priceInUSD ?? "",
        );

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
    setActiveIndex(-1);
  }, [results]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setOpen(Boolean(query.trim()));
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = i < results.length - 1 ? i + 1 : 0;
        resultRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = i > 0 ? i - 1 : results.length - 1;
        resultRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      resultRefs.current[activeIndex]?.click();
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        className="relative"
        onFocus={() =>
          setOpen(Boolean(query.trim()) || results.length > 0)
        }
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("search")}
          aria-label={t("search")}
          aria-expanded={open}
          aria-controls="search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
          }
          role="combobox"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 pe-10 text-sm text-foreground outline-none transition-shadow placeholder:text-text-muted focus:border-gold focus:ring-2 focus:ring-gold/20"
        />

        <div className="absolute inset-y-0 end-3 flex items-center">
          {open ? (
            <button
              type="button"
              aria-label={t("clear")}
              className="text-text-muted transition-colors hover:text-foreground"
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
          id="search-results"
          role="listbox"
          className="absolute inset-x-0 z-50 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg max-md:inset-x-auto max-md:start-1/2 max-md:w-[min(calc(100vw-2rem),28rem)] max-md:-translate-x-1/2 rtl:max-md:translate-x-1/2"
        >
          <div className="px-4 py-2 text-xs font-semibold text-text-secondary">
            {t("products")}
          </div>

          <div className="max-h-[22rem] overflow-auto">
            {results.length > 0 ? (
              results.map((product, i) => (
                <Link
                  key={product.id}
                  id={`search-result-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  ref={(el) => {
                    resultRefs.current[i] = el;
                  }}
                  href={`/${RoutePath.product}/${product.slug}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    i === activeIndex
                      ? "bg-surface-2"
                      : "hover:bg-surface-2"
                  }`}
                  style={
                    i === activeIndex
                      ? { boxShadow: "inset 2px 0 0 0 var(--gold)" }
                      : undefined
                  }
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                    <ImageVideo resource={product.image as Media} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      <HighlightedText text={product.title} query={query} />
                    </div>
                  </div>

                  <div className="shrink-0 text-sm font-semibold text-gold">
                    <Price
                      amount={
                        (product as any).priceInEGP ??
                        product.priceInUSD ??
                        0
                      }
                    />
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <FiSearch className="h-6 w-6 text-text-muted" />
                <span className="text-sm text-text-secondary">
                  {t("noMatch")}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}