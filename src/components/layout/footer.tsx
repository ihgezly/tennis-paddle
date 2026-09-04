import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { TbWorld } from "react-icons/tb";

import type { SiteSetting } from "@/payload-types";

export default function Footer({ footer }: { footer: SiteSetting["footer"] }) {
  if (!footer) return null;

  return (
    <footer className="w-full border-t bg-background text-foreground">
      <div className="container mx-auto flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-1 text-sm md:items-start">
          {footer.title && <div className="font-bold">{footer.title}</div>}
          {footer.address && <div>{footer.address}</div>}
        </div>

        <div className="hidden flex-col gap-1 text-sm md:flex md:items-end">
          {footer.phone && (
            <a href={`tel:${footer.phone}`} className="hover:underline">
              {footer.phone}
            </a>
          )}
          {footer.email && (
            <a href={`mailto:${footer.email}`} className="hover:underline">
              {footer.email}
            </a>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {footer.social?.instagram && (
            <a
              href={`https://instagram.com/${footer.social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            >
              <FaInstagram className="text-lg" />
            </a>
          )}

          {footer.social?.facebook && (
            <a
              href={`https://facebook.com/${footer.social.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            >
              <FaFacebookF className="text-lg" />
            </a>
          )}

          {footer.social?.whatsappNumber && (
            <a
              href={`https://wa.me/${footer.social.whatsappNumber}${footer.social.whatsappMessage ? `?text=${encodeURIComponent(footer.social.whatsappMessage)}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            >
              <FaWhatsapp className="text-lg" />
            </a>
          )}

          {footer.phone && (
            <a
              href={`tel:${footer.phone}`}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            >
              <HiOutlinePhone className="text-lg" />
            </a>
          )}

          {footer.email && (
            <a
              href={`mailto:${footer.email}`}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            >
              <HiOutlineMail className="text-lg" />
            </a>
          )}

          {footer.website && (
            <a
              href={footer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:border-gold hover:text-gold transition"
            >
              <TbWorld className="text-lg" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm md:hidden">
          {footer.phone && <a href={`tel:${footer.phone}`}>{footer.phone}</a>}
          {footer.phone && footer.email && <span>|</span>}
          {footer.email && (
            <a href={`mailto:${footer.email}`}>{footer.email}</a>
          )}
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} {footer.title || "Ace Gear Store"}. All rights reserved.
      </div>
    </footer>
  );
}