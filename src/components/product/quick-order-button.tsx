"use client";

import { useState } from "react";
import { FiShoppingBag } from "react-icons/fi";

import type { Media } from "@/lib/core/types/payload-types";

import QuickOrderModal from "@/components/product/quick-order-modal";
import "@/lib/styles/quick-order.css";

type Props = {
  product: {
    id: number;
    title: string;
    price: number;
    image?: Media | null;
    inStock: boolean;
  };
};

export default function QuickOrderButton({ product }: Props) {
  const [open, setOpen] = useState(false);

  const disabled = !product.inStock;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="quick-buy-button"
        aria-label={`شراء ${product.title} الآن`}
      >
        <FiShoppingBag size={20} />
        {disabled ? "غير متاح" : "اشتري الآن"}
      </button>

      <QuickOrderModal
        open={open}
        onClose={() => setOpen(false)}
        product={{
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
        }}
      />
    </>
  );
}