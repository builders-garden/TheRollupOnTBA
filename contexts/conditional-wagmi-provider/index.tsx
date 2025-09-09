"use client";

import { ReactNode } from "react";
import { wagmiConfigMiniApp, wagmiConfigReown } from "@/lib/reown";
import { useMiniApp } from "../mini-app-context";
import { CustomWagmiProvider } from "./wagmi-provider";

interface ConditionalWagmiProviderProps {
  children: ReactNode;
  cookie: string | null;
}

export const ConditionalWagmiProvider = ({
  children,
  cookie,
}: ConditionalWagmiProviderProps) => {
  const { isInMiniApp, isLoading: isCheckingMiniAppContext } = useMiniApp();

  if (isCheckingMiniAppContext) {
    // Show nothing while detecting environment
    return null;
  }

  if (isInMiniApp) {
    // Use MiniApp Wagmi config for Farcaster environment
    return (
      <CustomWagmiProvider config={wagmiConfigMiniApp} cookie={cookie}>
        {children}
      </CustomWagmiProvider>
    );
  } else {
    // Use DaimoPay-compatible Wagmi config for browser environment
    return (
      <CustomWagmiProvider config={wagmiConfigReown} cookie={cookie}>
        {children}
      </CustomWagmiProvider>
    );
  }
};
