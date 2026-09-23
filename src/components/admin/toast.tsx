"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/core/util";

export type ToastType = "success" | "error";

export type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
};

type Props = {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
};

export default function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        "admin-toast",
        toast.type === "success"
          ? "admin-toast--success"
          : "admin-toast--error",
      )}
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      role="alert"
    >
      {toast.message}
    </div>
  );
}