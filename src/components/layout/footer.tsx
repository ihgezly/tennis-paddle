import Link from "next/link";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { FiArrowRight } from "react-icons/fi";

import type { SiteSetting } from "@/payload-types";

import SignatureLine from "@/components/shared/signature-line";

const SHOP_LINKS = [
  { label: "كل المنتجات", href: "/categories" },
  { label: "مضارب البادل", href: "/category/padel" },
  { label: "مضارب التنس", href: "/category/tennis" },
  { label: "الأحذية", href: "/categories" },
];

const SUPPORT_LINKS = [
  { label: "بِع معداتك", href: "/sell" },
  { label: "حسابي", href: "/account/orders" },
  { label: "من نحن", href: "/" },
  { label: "اتصل بنا", href: "/" },
];

export default function Footer({ footer }: { footer: SiteSetting["footer"] }) {
  return (
    <footer className="relative mt-24 w-full overflow-hidden border-t border-border bg-surface">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--volt-glow) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <SignatureLine />

      <div className="container relative z-10 mx-auto">
        {/* ─── TOP: Brand + Contact ─── */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight">
                Padel<span className="text-volt">.</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
              متجرك الموثوق لمعدات البادل والتنس والأحذية الأصلية. جودة عالية،
              أسعار منافسة، وخدمة عملاء على مدار الساعة.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="glass-panel rounded-full px-4 py-1.5 text-[11px] font-medium text-foreground">
                ✓ منتجات أصلية 100%
              </span>
              <span className="glass-panel rounded-full px-4 py-1.5 text-[11px] font-medium text-foreground">
                ⚡ شحن سريع
              </span>
              <span className="glass-panel rounded-full px-4 py-1.5 text-[11px] font-medium text-foreground">
                ↩ استرجاع خلال 14 يوم
              </span>
            </div>
          </div>

          {/* Shop links */}
          <div className="md:col-span-2">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-volt">
              المتجر
            </h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-secondary transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div className="md:col-span-2">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-volt">
              الدعم
            </h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-secondary transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-volt">
              تواصل معنا
            </h4>

            <ul className="space-y-3">
              {footer?.phone ? (
                <li>
                  <a
                    href={`tel:${footer.phone}`}
                    className="group flex items-center gap-3 text-sm text-text-secondary transition-colors hover:text-foreground"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition group-hover:border-volt group-hover:text-volt">
                      <HiOutlinePhone size={14} />
                    </span>
                    <span className="mono-num" dir="ltr">
                      {footer.phone}
                    </span>
                  </a>
                </li>
              ) : null}

              {footer?.email ? (
                <li>
                  <a
                    href={`mailto:${footer.email}`}
                    className="group flex items-center gap-3 text-sm text-text-secondary transition-colors hover:text-foreground"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition group-hover:border-volt group-hover:text-volt">
                      <HiOutlineMail size={14} />
                    </span>
                    <span dir="ltr">{footer.email}</span>
                  </a>
                </li>
              ) : null}

              {footer?.address ? (
                <li className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border">
                    <HiOutlineLocationMarker size={14} />
                  </span>
                  <span>{footer.address}</span>
                </li>
              ) : null}
            </ul>

            {/* Socials */}
            <div className="mt-6 flex gap-2">
              {footer?.social?.instagram ? (
                <a
                  href={`https://instagram.com/${footer.social.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition-all hover:border-volt hover:text-volt hover:shadow-[0_0_16px_var(--volt-glow)]"
                >
                  <FaInstagram size={16} />
                </a>
              ) : null}

              {footer?.social?.facebook ? (
                <a
                  href={`https://facebook.com/${footer.social.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition-all hover:border-volt hover:text-volt hover:shadow-[0_0_16px_var(--volt-glow)]"
                >
                  <FaFacebookF size={16} />
                </a>
              ) : null}

              {footer?.social?.whatsappNumber ? (
                <a
                  href={`https://wa.me/${footer.social.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition-all hover:border-volt hover:text-volt hover:shadow-[0_0_16px_var(--volt-glow)]"
                >
                  <FaWhatsapp size={16} />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* ─── MIDDLE: Newsletter CTA ─── */}
        <div className="border-t border-border py-10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h3 className="text-xl font-semibold">
                اشترك في النشرة البريدية
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                اطلع على أحدث المنتجات والعروض أول بأول.
              </p>
            </div>
            <Link
              href="/register"
              className="volt-cta group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              أنشئ حسابك الآن
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ─── BOTTOM: Copyright ─── */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 md:flex-row">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} {footer?.title || "Padel Store"}. كل
            الحقوق محفوظة.
          </p>

          <div className="flex items-center gap-5 text-xs text-text-muted">
            <Link href="/" className="transition-colors hover:text-volt">
              الخصوصية
            </Link>
            <Link href="/" className="transition-colors hover:text-volt">
              الشروط
            </Link>
            <Link href="/" className="transition-colors hover:text-volt">
              الكوكيز
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}