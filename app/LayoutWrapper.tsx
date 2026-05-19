"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.remove("page-enter-active");
    el.classList.add("page-enter");

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add("page-enter-active");
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div ref={ref} className="main-container">
      {children}
    </div>
  );
};
