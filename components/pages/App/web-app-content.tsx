"use client";

import { AnimatePresence } from "motion/react";
import { useLayoutEffect } from "react";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";
import { WebAppStreamPage } from "../web-app-stream-page";

export default function WebAppContent({ brandSlug }: { brandSlug: string }) {
  const {
    isLoading,
    error,
    brand: { setBrandSlug },
  } = useWebAppAuth();

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
          <WebAppStreamPage key="stream" />
        )}
      </AnimatePresence>
    </div>
  );
}
