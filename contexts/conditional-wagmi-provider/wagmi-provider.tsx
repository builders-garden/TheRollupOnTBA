"use client";

import { DaimoPayProvider } from "@daimo/pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ResolvedRegister } from "@wagmi/core";
import { cookieToInitialState, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

interface CustomWagmiProviderProps {
  config: ResolvedRegister["config"]; // wagmi config
  children: React.ReactNode;
  cookie: string | null;
}

export const CustomWagmiProvider = ({
  config,
  children,
  cookie,
}: CustomWagmiProviderProps) => {
  const initialState = cookieToInitialState(config, cookie);
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider>{children}</DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
