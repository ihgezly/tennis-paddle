"use client";

import { useCallback } from "react";

import GenericForm from "@/components/shared/generic-form";
import {
  checkoutFormConfig,
  type CheckoutFormData,
  type CheckoutFormProps,
} from "@/lib/core/types/form";
import { postJson } from "@/lib/core/util";

export default function CheckoutForm({
  cartId,
  onSuccess,
}: CheckoutFormProps) {
  const submitOrder = useCallback(
    async (data: CheckoutFormData) => {
      const result = await postJson<{ orderId: number }>("checkout", {
        cartId,
        name: data.name,
        phone: data.phone,
        email: data.email,
      });
      return String(result.orderId);
    },
    [cartId],
  );

  return (
    <GenericForm
      config={checkoutFormConfig}
      onSubmit={submitOrder}
      onSuccess={async (orderId) => {
        onSuccess(orderId);
      }}
      disabled={!cartId}
    />
  );
}