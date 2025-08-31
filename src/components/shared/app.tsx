"use client";

import { type ReactNode } from "react";
import { AppProvider } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import { OverlayConfig, PageContent } from "@/types";
import { LoginIcon } from "./icons/login-icon";

interface GameProps {
  children: ReactNode;
  initialPageContent?: PageContent;
  initialOverlayContent?: OverlayConfig;
}

export default function App({
  children,
  initialPageContent,
  initialOverlayContent,
}: GameProps) {
  const { isMiniAppReady, context, isInMiniApp } = useFarcaster();
  const { error, isLoading, isSignedIn } = useAuth();

  return (
    <main className="h-screen w-screen max-w-md mx-auto overflow-hidden">
      {!isMiniAppReady && context && !isInMiniApp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-black text-xl font-medium">Loading...</p>
          </div>
        </div>
      ) : null}
      {error && isInMiniApp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-4 w-fit">
            <div className="p-6 bg-red-500/20 backdrop-blur-sm rounded-lg border-2 border-red-500">
              <p className="text-red-100 text-lg font-medium text-center">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {isMiniAppReady && !isSignedIn && !error && !isInMiniApp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-4 w-fit">
            <LoginIcon />
            <p className="text-black text-lg font-medium text-center">
              {isLoading ? "Signing in..." : "Signed in"}
            </p>
          </div>
        </div>
      ) : null}

      <AppProvider
        initialPageContent={initialPageContent}
        initialOverlayContent={initialOverlayContent}>
        {children}
      </AppProvider>
    </main>
  );
}
