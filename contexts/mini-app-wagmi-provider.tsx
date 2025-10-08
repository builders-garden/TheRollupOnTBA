"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ResolvedRegister, State } from "@wagmi/core";
import { WagmiProvider } from "wagmi";
import { wagmiConfigMiniApp } from "@/lib/reown";

const queryClient = new QueryClient();

interface MiniAppWagmiProviderProps {
  children: React.ReactNode;
  initialState?: State;
}

export const MiniAppWagmiProvider = ({
  children,
  initialState,
}: MiniAppWagmiProviderProps) => {
  return (
    <WagmiProvider config={wagmiConfigMiniApp} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
