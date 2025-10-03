"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { State } from "wagmi";
import { AdminAuthProvider } from "@/contexts/auth/admin-auth-context";
import { MiniAppAuthProvider } from "@/contexts/auth/mini-app-auth-context";
import { WebAppAuthProvider } from "@/contexts/auth/web-app-auth-context";
import { ErudaProvider } from "@/contexts/eruda";
import { useMiniApp } from "@/contexts/mini-app-context";
import { NotificationQueueProvider } from "@/contexts/notification-queue-context";
import { SocketProvider } from "@/contexts/socket-context";
import { CustomWagmiProvider } from "@/contexts/wagmi-provider";
import { wagmiConfigMiniApp } from "@/lib/reown";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
  initialState?: State;
}

export default function Providers({ children, initialState }: ProvidersProps) {
  const { isInMiniApp, isLoading: isCheckingMiniAppContext } = useMiniApp();

  // The current url path name
  const pathName = usePathname();

  // TODO: If we are checking the miniapp context, show nothing
  if (isCheckingMiniAppContext) {
    return null;
  }

  // If we are not in a miniapp, and the url includes "overlay" apply the overlay wrapper
  if (!isInMiniApp && pathName.includes("overlay")) {
    return (
      <SocketProvider>
        <NotificationQueueProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors position="top-right" />
          </QueryClientProvider>
        </NotificationQueueProvider>
      </SocketProvider>
    );
  }

  // If we are not in the miniapp but the url includes "admin", apply the admin wrapper
  if (!isInMiniApp && pathName.includes("admin")) {
    return (
      <NuqsAdapter>
        <CustomWagmiProvider
          config={wagmiConfigMiniApp}
          initialState={initialState}>
          <AdminAuthProvider>
            <SocketProvider>
              <NotificationQueueProvider>
                {children}
                <Toaster richColors position="top-right" />
              </NotificationQueueProvider>
            </SocketProvider>
          </AdminAuthProvider>
        </CustomWagmiProvider>
      </NuqsAdapter>
    );
  }

  // If we are in the miniapp, apply the miniapp wrapper
  if (isInMiniApp) {
    return (
      <NuqsAdapter>
        <CustomWagmiProvider
          config={wagmiConfigMiniApp}
          initialState={initialState}>
          <MiniAppAuthProvider>
            <ErudaProvider>
              <SocketProvider>
                <NotificationQueueProvider>
                  {children}
                  <Toaster richColors position="bottom-center" />
                </NotificationQueueProvider>
              </SocketProvider>
            </ErudaProvider>
          </MiniAppAuthProvider>
        </CustomWagmiProvider>
      </NuqsAdapter>
    );
  }

  // If we are not in the miniapp, but connecting to the / path, show the web version of the app
  return (
    <NuqsAdapter>
      <CustomWagmiProvider
        config={wagmiConfigMiniApp}
        initialState={initialState}>
        <WebAppAuthProvider>
          <SocketProvider>
            <NotificationQueueProvider>
              {children}
              <Toaster richColors position="top-right" />
            </NotificationQueueProvider>
          </SocketProvider>
        </WebAppAuthProvider>
      </CustomWagmiProvider>
    </NuqsAdapter>
  );
}
