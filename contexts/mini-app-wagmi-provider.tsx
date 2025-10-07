"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ResolvedRegister, State } from "@wagmi/core";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

interface MiniAppWagmiProviderProps {
  config: ResolvedRegister["config"]; // wagmi config
  children: React.ReactNode;
  initialState?: State;
}

export const MiniAppWagmiProvider = ({
  config,
  children,
  initialState,
}: MiniAppWagmiProviderProps) => {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
