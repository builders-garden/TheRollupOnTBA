"use client";

import { AnimatePresence } from "motion/react";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { StreamPage } from "../stream-page";

export default function MainContent() {
  const { isLoading, error } = useMiniAppAuth();

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
