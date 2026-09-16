"use client";

import useEmblaCarousel from "embla-carousel-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";

type Props = {
  children: ReactNode[];
};

export default function NewArrivalsCarousel({ children }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
    skipSnaps: false,
  });

  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4">
        {children.map((child, i) => {
          const isActive = i === selected;
          const distance = Math.abs(i - selected);

          return (
            <div
              key={i}
              className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_22%] xl:flex-[0_0_19%] transition-all duration-500"
              style={{
                transform: isActive ? "scale(1)" : "scale(0.96)",
                opacity: distance > 2 ? 0.55 : distance > 1 ? 0.85 : 1,
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}