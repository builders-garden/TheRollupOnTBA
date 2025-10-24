"use client";

import { useEffect } from "react";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";

export function useTheme(brandSlug: string) {
  useEffect(() => {
    // Remove existing theme classes
    document.documentElement.classList.remove("theRollup");

    // Apply theme based on brandSlug
    if (brandSlug === THE_ROLLUP_BRAND_SLUG) {
      document.documentElement.classList.add("theRollup");
    }
  }, [brandSlug]);
}
