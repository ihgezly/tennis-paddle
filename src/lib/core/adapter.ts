import type { Product, Variant, Cart } from "@/lib/core/types/payload-types";
import type {
  ProductPurchaseSectionData,
  CartItem,
  CombinedVariantData,
} from "@/lib/core/types/types";

export const getCartQuantity = (
  cart: Cart | null | undefined,
): number | undefined => {
  if (!cart?.items?.length) return undefined;
  return cart.items.reduce((sum, it) => sum + Number(it?.quantity ?? 0), 0);
};

const pickPrice = (product: any, variant: any): number | undefined => {
  return (
    variant?.priceInEGP ??
    product?.priceInEGP ??
    variant?.priceInUSD ??
    product?.priceInUSD ??
    undefined
  );
};

const pickOriginalPrice = (product: any, variant: any): number | undefined => {
  return (
    variant?.originalPriceInEGP ??
    product?.originalPriceInEGP ??
    variant?.originalPriceInUSD ??
    product?.originalPriceInUSD ??
    undefined
  );
};

const getCartItemData = (item: CartItem) => {
  const product = item.product as Product;
  if (!product) return null;

  const variant =
    typeof item?.variant === "object" ? (item.variant as Variant) : null;

  return {
    product,
    variant,
    isVariant: Boolean(variant),
    price: pickPrice(product, variant),
    originalPrice: pickOriginalPrice(product, variant),
  };
};

type CartRow = {
  item: CartItem;
  data: NonNullable<ReturnType<typeof getCartItemData>>;
};

export const buildCartRows = (cart: Cart | null | undefined): CartRow[] => {
  if (!cart?.items || !Array.isArray(cart.items)) return [];

  return (cart.items as CartItem[]).reduce<CartRow[]>((acc, item) => {
    const data = getCartItemData(item);
    if (data) acc.push({ item, data });
    return acc;
  }, []);
};

type PurchaseOption =
  ProductPurchaseSectionData["variants"][number]["options"][number];

export const buildProductPurchaseSectionData = (
  product: Product,
  combined: CombinedVariantData,
): ProductPurchaseSectionData & {
  conditionType?: Product["conditionType"];
  conditionGrade?: Product["conditionGrade"];
  conditionNotes?: Product["conditionNotes"];
  glbModel?: Product["glbModel"];
} => {
  const basePrice = pickPrice(product, null) ?? 0;

  const base_ans = {
    id: product.id,
    inventory: product.inventory!,
    price: basePrice,
    originalPrice: pickOriginalPrice(product, null),
    variants: [],
    priceRange: { min: 0, max: 0 },
    conditionType: product.conditionType ?? null,
    conditionGrade: product.conditionGrade ?? null,
    conditionNotes: product.conditionNotes ?? null,
    glbModel: product.glbModel ?? null,
  };

  if (!combined) {
    return base_ans;
  }

  const variants: ProductPurchaseSectionData["variants"] = combined.variantTypes
    .map((type) => {
      const typeId = String(type.id);

      const options: PurchaseOption[] = combined.options
        .filter((o) => String(o.variantType) === typeId)
        .map((o): PurchaseOption | null => {
          const v = combined.variants.find(
            (x) =>
              x.options &&
              x.options.some((id) => String(id) === String(o.id)),
          );

          if (!v) return null;

          const vAny = v as any;
          const price =
            vAny.priceInEGP ??
            vAny.priceInUSD ??
            basePrice;
          const originalPrice =
            vAny.originalPriceInEGP ??
            vAny.originalPriceInUSD ??
            undefined;

          return {
            id: String(v.id),
            label: o.label,
            inventory: v.inventory,
            price,
            originalPrice,
          };
        })
        .filter((x): x is PurchaseOption => Boolean(x))
        .sort((a, b) => a.price - b.price);

      if (!options.length) return null;

      return {
        typeId,
        typeLabel: type.label,
        options,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const prices = variants
    .flatMap((t) => t.options.map((o) => o.price))
    .sort((a, b) => a - b);

  return {
    ...base_ans,
    variants,
    priceRange: prices.length
      ? { min: prices[0], max: prices[prices.length - 1] }
      : { min: 0, max: 0 },
  };
};