"use client";

import { createAppKit } from "@reown/appkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Config } from "@wagmi/core";
import { basePreconf } from "viem/chains";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { wagmiAdapter } from "@/lib/reown";
import { env } from "@/lib/zod";

const queryClient = new QueryClient();

interface WebAppWagmiProviderProps {
  children: React.ReactNode;
}

export const WebAppWagmiProvider = ({ children }: WebAppWagmiProviderProps) => {
  // Create the initial state
  const wagmiWebAppInitialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={wagmiWebAppInitialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
