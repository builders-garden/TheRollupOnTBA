"use client";

import { AnimatePresence } from "motion/react";
import { useLayoutEffect } from "react";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";
import { MiniAppStreamPage } from "../mini-app-stream-page";

export default function MiniAppContent({ brandSlug }: { brandSlug: string }) {
  const {
    isLoading,
    error,
    brand: { setBrandSlug },
  } = useMiniAppAuth();

  useLayoutEffect(() => {
    setBrandSlug(brandSlug);
  }, [brandSlug, setBrandSlug]);

  return (
    <div className="min-h-screen no-scrollbar">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingPage key="loading" />
        ) : error ? (
          <ErrorPage key="error" errorMessage={error.message} />
        ) : (
          <MiniAppStreamPage key="stream" />
        )}
      </AnimatePresence>
    </div>
  );
}
