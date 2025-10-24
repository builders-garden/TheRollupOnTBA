"use client";

import { useEffect } from "react";

export function useTheme(brandSlug: string) {
  useEffect(() => {
    // Remove existing theme classes
    document.documentElement.classList.remove("theRollup");

    // Apply theme based on brandSlug
    if (brandSlug === "the_rollup") {
      document.documentElement.classList.add("theRollup");
    }
  }, [brandSlug]);
}
