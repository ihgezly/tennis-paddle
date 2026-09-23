"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

type Props = {
  onNotify: (type: "success" | "error", message: string) => void;
};

export default function CallmebotWidget({ onNotify }: Props) {
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/callmebot/test", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "فشل الاختبار");
      }

      onNotify("success", "تم إرسال رسالة الاختبار ✅");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      onNotify("error", `فشل الإرسال: ${msg}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="admin-callmebot">
      <div className="admin-callmebot__info">
        <div className="admin-callmebot__icon">
          <FaWhatsapp />
        </div>
        <div className="admin-callmebot__text">
          <div className="admin-callmebot__title">
            إشعارات Callmebot
          </div>
          <div className="admin-callmebot__status">
            يصلك إشعار واتساب عند كل طلب جديد
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleTest}
        disabled={testing}
        className="admin-btn admin-btn--ghost"
      >
        {testing ? "جارٍ الاختبار..." : "اختبار الإشعار"}
      </button>
    </div>
  );
}