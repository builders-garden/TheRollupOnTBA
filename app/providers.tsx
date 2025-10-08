"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "@/contexts/auth/admin-auth-context";
import { MiniAppAuthProvider } from "@/contexts/auth/mini-app-auth-context";
import { WebAppAuthProvider } from "@/contexts/auth/web-app-auth-context";
import { ErudaProvider } from "@/contexts/eruda";
import { useMiniApp } from "@/contexts/mini-app-context";
import { MiniAppWagmiProvider } from "@/contexts/mini-app-wagmi-provider";
import { NotificationQueueProvider } from "@/contexts/notification-queue-context";
import { SocketProvider } from "@/contexts/socket-context";
import { WebAppWagmiProvider } from "@/contexts/web-app-wagmi-provider";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
  cookies: string | null;
}

export default function Providers({ children, cookies }: ProvidersProps) {
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
        <MiniAppWagmiProvider>
          <AdminAuthProvider>
            <SocketProvider>
              <NotificationQueueProvider>
                {children}
                <Toaster richColors position="top-right" />
              </NotificationQueueProvider>
            </SocketProvider>
          </AdminAuthProvider>
        </MiniAppWagmiProvider>
      </NuqsAdapter>
    );
  }

  // If we are in the miniapp, apply the miniapp wrapper
  if (isInMiniApp) {
    return (
      <NuqsAdapter>
        <MiniAppWagmiProvider>
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
        </MiniAppWagmiProvider>
      </NuqsAdapter>
    );
  }

  // If we are not in the miniapp, but connecting to the / path, show the web version of the app
  return (
    <NuqsAdapter>
      <WebAppWagmiProvider cookies={cookies}>
        <WebAppAuthProvider>
          <SocketProvider>
            <NotificationQueueProvider>
              {children}
              <Toaster richColors position="top-right" />
            </NotificationQueueProvider>
          </SocketProvider>
        </WebAppAuthProvider>
      </WebAppWagmiProvider>
    </NuqsAdapter>
  );
}
