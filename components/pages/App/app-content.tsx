"use client";

import { AnimatePresence } from "motion/react";
import Image from "next/image";
import { Separator } from "@/components/shadcn-ui/separator";
import { NBButton } from "@/components/shared/mini-app/nb-button";
import { NBCard } from "@/components/shared/mini-app/nb-card";
import { ShareButton } from "@/components/shared/share-button";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { StreamPage } from "../stream-page";

export default function MainContent() {
  const { isLoading, error } = useAuth();

  const debouncedIsLoading = useDebounce(isLoading, 1000);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {debouncedIsLoading ? (
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
