"use client";

import { useState, useCallback } from "react";

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
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = useCallback(
    async (data: CheckoutFormData) => {
      setError(null);
      try {
        const result = await postJson<{ iframeUrl: string }>(
          "paymob/initiate",
          {
            orderId: cartId,
            name: data.name,
            phone: data.phone,
            email: data.email,
          },
        );
        setIframeUrl(result.iframeUrl);
        return result.iframeUrl;
      } catch (err: any) {
        setError(err.message || "Payment initiation failed");
        throw err;
      }
    },
    [cartId],
  );

  if (iframeUrl) {
    return (
      <div className="w-full max-w-md mx-auto my-8">
        <h2 className="text-lg font-semibold mb-4">Complete payment</h2>
        <iframe
          src={iframeUrl}
          className="w-full h-[600px] border rounded-md"
          allow="payment"
        />
        <button
          className="mt-4 underline text-sm"
          onClick={() => setIframeUrl(null)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <GenericForm
        config={checkoutFormConfig}
        onSubmit={submitOrder}
        onSuccess={async (iframeUrl) => {
          onSuccess(iframeUrl);
        }}
        disabled={!cartId}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}