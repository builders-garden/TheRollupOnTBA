"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ErudaProvider } from "@/contexts/eruda";
import { FarcasterProvider } from "@/contexts/farcaster-context";
import { NotificationQueueProvider } from "@/contexts/notification-queue-context";
import { SocketProvider } from "@/contexts/socket-context";
import { CustomWagmiProvider } from "@/contexts/conditional-wagmi-provider/wagmi-provider";
import { State } from "wagmi";
import { wagmiConfigMiniApp } from "@/lib/reown";

export default function Providers({
  children,
  initialState,

}: {
  children: React.ReactNode;
  cookie: string | null;
  initialState: State | undefined;
}) {
  return (
    <ErudaProvider>
          <CustomWagmiProvider config={wagmiConfigMiniApp} initialState={initialState}>
          <FarcasterProvider addMiniAppOnLoad={true}>
          {/* <AuthProvider> */}
          <SocketProvider>
            <NotificationQueueProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </NotificationQueueProvider>
          </SocketProvider>
          {/* </AuthProvider> */}
        </FarcasterProvider>
      </CustomWagmiProvider>
    </ErudaProvider>
  );
}
