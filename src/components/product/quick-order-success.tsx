"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

import {
  getPaymentInstructions,
  getThankYouMessage,
} from "@/lib/core/quick-order";

type Props = {
  orderId: number;
  productTitle: string;
  amount: number;
  whatsappLink: string | null;
  onClose: () => void;
};

export default function QuickOrderSuccess({
  orderId,
  amount,
  whatsappLink,
}: Props) {
  const paymentInstructions = getPaymentInstructions();
  const thankYouMessage = getThankYouMessage();

  return (
    <div className="quick-order-success">
      <div className="quick-order-success__icon">
        <svg viewBox="0 0 52 52" width="40" height="40">
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="var(--volt)"
            strokeWidth="2"
            strokeDasharray="151"
            strokeDashoffset="0"
          />
          <path
            d="M15 27l7 7 15-15"
            fill="none"
            stroke="var(--volt)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="quick-order-success__title">تم تسجيل طلبك ✅</h2>

      <p className="quick-order-success__subtitle">{thankYouMessage}</p>

      <div className="quick-order-success__order-id">طلب #{orderId}</div>

      <div className="quick-order-success__instructions">
        {paymentInstructions}
      </div>

      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="quick-order-success__whatsapp"
        >
          <FaWhatsapp size={20} />
          تأكيد الطلب على واتساب
        </a>
      ) : null}

      <Link href="/" className="quick-order-success__continue">
        أو كمّل تصفح المنتجات →
      </Link>
    </div>
  );
}