"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { MiniAppAuthProvider } from "@/contexts/auth/mini-app-auth-context";
import { ConditionalWagmiProvider } from "@/contexts/conditional-wagmi-provider";
import { ErudaProvider } from "@/contexts/eruda";
import { useMiniApp } from "@/contexts/mini-app-context";
import { NotificationQueueProvider } from "@/contexts/notification-queue-context";
import { SocketProvider } from "@/contexts/socket-context";

export default function Providers({
  children,
  cookie,
}: {
  children: React.ReactNode;
  cookie: string | null;
}) {
  const { isInMiniApp, isLoading: isCheckingMiniAppContext } = useMiniApp();

  // The current url path name
  const pathName = document.location.pathname;

  // If we are checking the miniapp context, show a loading indicator
  if (isCheckingMiniAppContext) {
    return <div>Checking miniapp context...</div>;
  }

  // If we are not in a miniapp, and the url includes "overlay" apply the overlay wrapper
  if (!isInMiniApp && pathName.includes("overlay")) {
    return (
      <SocketProvider>
        <NotificationQueueProvider>{children}</NotificationQueueProvider>
      </SocketProvider>
    );
  }

  // If we are not in the miniapp but the url includes "admin", apply the admin wrapper
  if (!isInMiniApp && pathName.includes("admin")) {
    return (
      <NuqsAdapter>
        <ConditionalWagmiProvider cookie={cookie}>
          <SocketProvider>
            <NotificationQueueProvider>{children}</NotificationQueueProvider>
          </SocketProvider>
        </ConditionalWagmiProvider>
      </NuqsAdapter>
    );
  }

  // If we are in the miniapp, apply the miniapp wrapper
  if (isInMiniApp) {
    return (
      <NuqsAdapter>
        <MiniAppAuthProvider>
          <ErudaProvider>
            <ConditionalWagmiProvider cookie={cookie}>
              <SocketProvider>
                <NotificationQueueProvider>
                  {children}
                </NotificationQueueProvider>
              </SocketProvider>
            </ConditionalWagmiProvider>
          </ErudaProvider>
        </MiniAppAuthProvider>
      </NuqsAdapter>
    );
  }

  return null;
}
