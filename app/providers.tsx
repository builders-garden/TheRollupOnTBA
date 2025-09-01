"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "@/contexts/auth-context";
import { ConditionalWagmiProvider } from "@/contexts/conditional-wagmi-provider";
import { ErudaProvider } from "@/contexts/eruda";
import { FarcasterProvider } from "@/contexts/farcaster-context";

export default function Providers({
  children,
  cookie,
}: {
  children: React.ReactNode;
  cookie: string | null;
}) {
  return (
    <ErudaProvider>
      <ConditionalWagmiProvider cookie={cookie}>
        <FarcasterProvider addMiniAppOnLoad={true}>
          <AuthProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </AuthProvider>
        </FarcasterProvider>
      </ConditionalWagmiProvider>
    </ErudaProvider>
  );
}
