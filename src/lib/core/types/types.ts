import type {
  Cart,
  Order,
  Product,
  Review,
  Category,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

export enum RoutePath {
  product = "product",
  category = "category",
}

// ═══════════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════════

export enum CollectionName {
  products = "products",
  category = "category",
  productTypes = "product-types",
  conditionTypes = "condition-types",
  conditionGrades = "condition-grades",
  sellRequests = "sell-requests",
  auditLogs = "audit-logs",
  integrationEvents = "integration-events",
  media3d = "media3d",
  returnRequests = "return-requests",
  payments = "payments",
  inventoryReservations = "inventory-reservations",
  inventoryMovements = "inventory-movements",
}

// ═══════════════════════════════════════════════════════════════
// SPORT & PRODUCT TYPES
// ═══════════════════════════════════════════════════════════════

export enum SportType {
  PADEL = "padel",
  TENNIS = "tennis",
  SHOES = "shoes",
  GENERAL = "general",
}

// ─── Product Status ───
export enum ProductStatus {
  AVAILABLE = "available", // متاح للبيع
  PENDING = "pending",     // محجوز (عميل طلب ولسه الأدمن ما أكدش)
  SOLD = "sold",           // تم البيع
  DRAFT = "draft",         // مسودة (مش ظاهر)
}

// ✅ RacketShape — للمضارب
export enum RacketShape {
  ROUND = "round",
  TEARDROP = "teardrop",
  DIAMOND = "diamond",
}

export type ProductType = {
  id: number;
  title: string;
  slug: string;
  sportTypes: SportType[];
  icon: string | null;
  position: number;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
};

// ═══════════════════════════════════════════════════════════════
// ORDER STATUS
// ═══════════════════════════════════════════════════════════════

export enum OrderStatus {
  NEW = "new",
  PENDING_PAYMENT = "pending_payment",
  READY = "ready",
  DONE = "done",
  CANCELED = "canceled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  INITIATING = "initiating",
  AUTHORIZED = "authorized",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  REFUNDED = "refunded",
}

// ═══════════════════════════════════════════════════════════════
// CONDITION
// ═══════════════════════════════════════════════════════════════

export enum ConditionTypeCode {
  NEW = "new",
  USED = "used",
}

export enum ConditionGradeCode {
  LIKE_NEW = "like_new",
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
}

export enum InspectionStatus {
  DRAFT = "draft",
  PENDING_INSPECTION = "pending_inspection",
  INSPECTED = "inspected",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// ═══════════════════════════════════════════════════════════════
// SELL REQUEST
// ═══════════════════════════════════════════════════════════════

export enum SellRequestStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  CONTACTED = "contacted",
  OFFER_SENT = "offer_sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  ITEM_RECEIVED = "item_received",
  INSPECTING = "inspecting",
  ACCEPTED_FOR_RESALE = "accepted_for_resale",
  LISTED = "listed",
  CANCELLED = "cancelled",
}

export const SELL_REQUEST_STATUS_FLOW: Record<
  SellRequestStatus,
  SellRequestStatus[]
> = {
  [SellRequestStatus.PENDING]: [
    SellRequestStatus.UNDER_REVIEW,
    SellRequestStatus.REJECTED,
    SellRequestStatus.CANCELLED,
  ],
  [SellRequestStatus.UNDER_REVIEW]: [
    SellRequestStatus.CONTACTED,
    SellRequestStatus.REJECTED,
    SellRequestStatus.CANCELLED,
  ],
  [SellRequestStatus.CONTACTED]: [
    SellRequestStatus.OFFER_SENT,
    SellRequestStatus.REJECTED,
    SellRequestStatus.CANCELLED,
  ],
  [SellRequestStatus.OFFER_SENT]: [
    SellRequestStatus.ACCEPTED,
    SellRequestStatus.REJECTED,
    SellRequestStatus.CANCELLED,
  ],
  [SellRequestStatus.ACCEPTED]: [
    SellRequestStatus.ITEM_RECEIVED,
    SellRequestStatus.CANCELLED,
  ],
  [SellRequestStatus.ITEM_RECEIVED]: [SellRequestStatus.INSPECTING],
  [SellRequestStatus.INSPECTING]: [
    SellRequestStatus.ACCEPTED_FOR_RESALE,
    SellRequestStatus.REJECTED,
  ],
  [SellRequestStatus.ACCEPTED_FOR_RESALE]: [SellRequestStatus.LISTED],
  [SellRequestStatus.LISTED]: [],
  [SellRequestStatus.REJECTED]: [],
  [SellRequestStatus.CANCELLED]: [],
};

export const isValidSellRequestStatusTransition = (
  current: SellRequestStatus,
  next: string,
): next is SellRequestStatus => {
  return (SELL_REQUEST_STATUS_FLOW[current] || []).includes(
    next as SellRequestStatus,
  );
};

// ═══════════════════════════════════════════════════════════════
// RETURN REQUEST
// ═══════════════════════════════════════════════════════════════

export enum ReturnStatus {
  REQUESTED = "requested",
  APPROVED = "approved",
  REJECTED = "rejected",
  ITEM_RECEIVED = "item_received",
  INSPECTING = "inspecting",
  REFUNDED = "refunded",
  RESTOCKED = "restocked",
}

export const RETURN_STATUS_FLOW: Record<ReturnStatus, ReturnStatus[]> = {
  [ReturnStatus.REQUESTED]: [ReturnStatus.APPROVED, ReturnStatus.REJECTED],
  [ReturnStatus.APPROVED]: [ReturnStatus.ITEM_RECEIVED],
  [ReturnStatus.ITEM_RECEIVED]: [ReturnStatus.INSPECTING],
  [ReturnStatus.INSPECTING]: [ReturnStatus.REFUNDED, ReturnStatus.RESTOCKED],
  [ReturnStatus.REJECTED]: [],
  [ReturnStatus.REFUNDED]: [],
  [ReturnStatus.RESTOCKED]: [],
};

export const isValidReturnStatusTransition = (
  current: ReturnStatus,
  next: string,
): next is ReturnStatus => {
  return (RETURN_STATUS_FLOW[current] || []).includes(next as ReturnStatus);
};

// ═══════════════════════════════════════════════════════════════
// INTEGRATION
// ═══════════════════════════════════════════════════════════════

export enum IntegrationEventStatus {
  RECEIVED = "received",
  PROCESSING = "processing",
  PROCESSED = "processed",
  FAILED = "failed",
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const AppConst = {
  CACHE_TAG_BOOTSTRAP: "bootstrap",
  CACHE_TAG_SITEMAP: "sitemap",
  CACHE_TAG_PRODUCT_TYPES: "product-types",
} as const;

// ═══════════════════════════════════════════════════════════════
// COMMON TYPES
// ═══════════════════════════════════════════════════════════════

export type PropsSlug = { params: Promise<{ slug: string }> };

export type SitemapItem = { slug: string; updatedAt: string };
export type SitemapData = {
  products: SitemapItem[];
  categories: SitemapItem[];
};

export type CartItem = NonNullable<Cart["items"]>[number];
export type OrderItem = NonNullable<Order["items"]>[number];

// ═══════════════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════════════

export type ProductPurchaseSectionData = {
  id: Product["id"];
  title: string;           // ✅ جديد — للـQuickOrderButton
  image?: any;             // ✅ جديد — للـQuickOrderButton
  inventory: number;
  price: number;
  originalPrice?: number;
  variants: Array<{
    typeId: number | string;
    typeLabel: string;
    options: Array<{
      id: string;
      label: string;
      inventory: number;
      price: number;
      originalPrice?: number;
    }>;
  }>;
  priceRange: { min: number; max: number };
};

export type CombinedVariantData = {
  variants: {
    id: number;
    options: number[];
    inventory: number;
    priceInEGP: number;
    originalPriceInEGP?: number;
  }[];
  variantTypes: { id: number; label: string }[];
  options: { id: number; variantType: number; label: string }[];
} | null;

export type ProductSinglePage = Pick<
  Product,
  "title" | "description" | "updatedAt" | "gallery" | "faqs" | "id"
> & {
  categories?: Product["categories"];
  purchase_section: ProductPurchaseSectionData;
  relatedProducts: Product[];
  reviews: Review[];
  conditionType?: Product["conditionType"];
  conditionGrade?: Product["conditionGrade"];
  conditionNotes?: Product["conditionNotes"];
  glbModel?: Product["glbModel"];
  brand?: string | null;
};

// ═══════════════════════════════════════════════════════════════
// DAL STATIC INTERFACE
// ═══════════════════════════════════════════════════════════════

export type DalStatic = {
  queryAllProducts(): Promise<Product[]>;
  queryCategoryBySlug(slug: string): Promise<Category | null>;
  queryProductBySlug(slug: string): Promise<ProductSinglePage | null>;
  queryCategoriesBasic(): Promise<Category[]>;
  queryChildCategories(parentId: number): Promise<Category[]>;
  queryProductTypes(): Promise<ProductType[]>;
  queryProductTypesBySport(sportType: SportType | null): Promise<ProductType[]>;
  querySiteSettings(): Promise<SiteSetting>;
  querySitemapData(): Promise<SitemapData>;
  queryCurrentUser(req: Request): Promise<User | null>;
  queryDistinctBrands(categoryId?: number | null): Promise<string[]>;
  queryCategoryProductsPaginated(
    slug: string,
    options: {
      page?: number;
      limit?: number;
      brand?: string;
      condition?: string;
      sport?: string;
      type?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sort?: string;
    },
  ): Promise<{ products: Product[]; totalCount: number }>;
  queryHomeProducts(limit?: number): Promise<{
    products: Product[];
    conditionTypes: { id: number; code: string }[];
    conditionGrades: { id: number; code: string }[];
  }>;
  runSportProducts(
    payload: any,
    options: {
      sportType?: SportType | null;
      productTypeId?: number | null;
      brand?: string;
      condition?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ products: Product[]; totalCount: number }>;
};