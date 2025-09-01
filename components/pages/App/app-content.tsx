"use client";

import { AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import ErrorPage from "../error";
import LoadingPage from "../loading";

export default function MainContent() {
  const { isLoading, error } = useAuth();

  const debouncedIsLoading = useDebounce(isLoading, 1000);

  return (
    <div className="h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {debouncedIsLoading ? (
          <LoadingPage key="loading" />
        ) : error ? (
          <ErrorPage key="error" errorMessage={error.message} />
        ) : (
          <div className="flex justify-center items-center h-full w-full">
            Hello World
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
