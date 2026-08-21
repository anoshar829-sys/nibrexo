"use client";

import { useEffect, useState } from "react";
import { ChevronUpIcon } from "@/components/ui/Icons";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 640);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={visible ? "back-to-top is-visible" : "back-to-top"}
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      Back to Top <ChevronUpIcon />
    </button>
  );
}
