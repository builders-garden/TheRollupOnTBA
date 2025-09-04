"use client";

import { AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { StreamPage } from "../stream-page";

export default function MainContent() {
  const { isLoading, error } = useAuth();

  //const debouncedIsLoading = useDebounce(isLoading, 1000);

  return (
    <div className="min-h-screen">
      {/* <AnimatePresence mode="wait">
        {debouncedIsLoading ? (
          <LoadingPage key="loading" />
        ) : ( */}
      <StreamPage key="stream" />
      {/* )}
      </AnimatePresence> */}
    </div>
  );
}
