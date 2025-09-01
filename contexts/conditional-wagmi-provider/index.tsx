"use client";

import { sdk as miniappSdk } from "@farcaster/miniapp-sdk";
import { ReactNode, useLayoutEffect, useState } from "react";
import { wagmiConfigMiniApp, wagmiConfigReown } from "@/lib/reown";
import { CustomWagmiProvider } from "./wagmi-provider";

interface ConditionalWagmiProviderProps {
  children: ReactNode;
  cookie: string | null;
}

export const ConditionalWagmiProvider = ({
  children,
  cookie,
}: ConditionalWagmiProviderProps) => {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const checkIsInMiniApp = async () => {
      const tmpIsInMiniApp = await miniappSdk.isInMiniApp();
      setIsInMiniApp(tmpIsInMiniApp);
      setIsLoading(false);
    };
    checkIsInMiniApp();
  }, []);

  if (isLoading) {
    // Show loading while detecting environment
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
