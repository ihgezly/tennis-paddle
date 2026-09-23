"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "popular";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "الأحدث",
  oldest: "الأقدم",
  price_asc: "الأرخص أولاً",
  price_desc: "الأغلى أولاً",
  popular: "الأكثر شعبية",
};

/**
 * Hook للتعامل مع فلاتر URL
 * يدعم multi-value بصيغة: ?brand=Nike,Adidas
 */
export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  // ─── Multi-value getters ───
  const getMulti = useCallback(
    (key: string): string[] => {
      const value = params.get(key);
      if (!value) return [];
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    },
    [params],
  );

  const getSingle = useCallback(
    (key: string): string | undefined => {
      return params.get(key) ?? undefined;
    },
    [params],
  );

  // ─── Multi-value setters ───
  const setMulti = useCallback(
    (key: string, values: string[]) => {
      const next = new URLSearchParams(params.toString());
      if (values.length === 0) {
        next.delete(key);
      } else {
        next.set(key, values.join(","));
      }
      next.delete("page"); // reset pagination
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const current = getMulti(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setMulti(key, next);
    },
    [getMulti, setMulti],
  );

  const setSingle = useCallback(
    (key: string, value: string | undefined | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const clearKey = useCallback(
    (key: string) => {
      const next = new URLSearchParams(params.toString());
      next.delete(key);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  // ─── Convenience getters ───
  const brands = useMemo(() => getMulti("brand"), [getMulti]);
  const conditions = useMemo(() => getMulti("condition"), [getMulti]);
  const sports = useMemo(() => getMulti("sport"), [getMulti]);
  const types = useMemo(() => getMulti("type"), [getMulti]);
  const minPrice = useMemo(() => getSingle("minPrice"), [getSingle]);
  const maxPrice = useMemo(() => getSingle("maxPrice"), [getSingle]);
  const sort = useMemo(
    () => (getSingle("sort") as SortOption) ?? "newest",
    [getSingle],
  );
  const search = useMemo(() => getSingle("q"), [getSingle]);

  // ─── Active count ───
  const activeCount = useMemo(
    () =>
      brands.length +
      conditions.length +
      sports.length +
      types.length +
      (minPrice ? 1 : 0) +
      (maxPrice ? 1 : 0) +
      (search ? 1 : 0),
    [brands, conditions, sports, types, minPrice, maxPrice, search],
  );

  const hasActiveFilters = activeCount > 0;

  return {
    // raw
    params,
    // getters
    brands,
    conditions,
    sports,
    types,
    minPrice,
    maxPrice,
    sort,
    search,
    // actions
    setMulti,
    toggleMulti,
    setSingle,
    clearAll,
    clearKey,
    // state
    activeCount,
    hasActiveFilters,
  };
}