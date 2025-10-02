"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { State } from "wagmi";
import { AdminAuthProvider } from "@/contexts/auth/admin-auth-context";
import { MiniAppAuthProvider } from "@/contexts/auth/mini-app-auth-context";
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

  // TODO: If we are checking the miniapp context, show a loading indicator
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

  // Hero page
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-gray-50 text-black">
      {/* Hero Section */}
      <div className="w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 mx-auto text-center">
        <div className="relative mb-8">
          <img
            src="/images/rollup_logo_black.png"
            alt="The Rollup Logo"
            className="h-16 mx-auto mb-6"
          />
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Control The Stream
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Turn viewing into action with The Rollup&apos;s interactive streaming
          experience. Engage with content, participate in real-time, and be part
          of the conversation.
        </p>
      </div>
    </div>
  );
}
