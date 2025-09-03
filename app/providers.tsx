"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConditionalWagmiProvider } from "@/contexts/conditional-wagmi-provider";
import { ErudaProvider } from "@/contexts/eruda";
import { FarcasterProvider } from "@/contexts/farcaster-context";
import { SocketProvider } from "@/contexts/socket-context";

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
          {/* <AuthProvider> */}
          <SocketProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </SocketProvider>
          {/* </AuthProvider> */}
        </FarcasterProvider>
      </ConditionalWagmiProvider>
    </ErudaProvider>
  );
}
