"use client";

import { AnimatePresence } from "motion/react";
import { useLayoutEffect } from "react";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { StreamPage } from "../stream-page";

export default function MainContent({ brandSlug }: { brandSlug?: string }) {
  const {
    isLoading,
    error,
    brand: { setBrandSlug },
  } = useMiniAppAuth();

  useLayoutEffect(() => {
    setBrandSlug(brandSlug || "rollup");
  }, [brandSlug, setBrandSlug]);

  return (
    <div className="min-h-screen no-scrollbar">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingPage key="loading" />
        ) : error ? (
          <ErrorPage key="error" errorMessage={error.message} />
        ) : (
          <StreamPage key="stream" />
        )}
      </AnimatePresence>
    </div>
  );
}
