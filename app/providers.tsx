"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
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
              <NotificationQueueProvider>{children}</NotificationQueueProvider>
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
                </NotificationQueueProvider>
              </SocketProvider>
            </ErudaProvider>
          </MiniAppAuthProvider>
        </CustomWagmiProvider>
      </NuqsAdapter>
    );
  }

  // TODO: Add a page that describes the app and the fact that it should be used in a client app
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

        {/* Features Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"> */}
        {/* <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"> */}
        {/* <h3 className="text-lg font-semibold mb-3">Live Interaction</h3> */}
        {/* <p className="text-gray-600"> */}
        {/* Engage with streams in real-time through Farcaster's interactive */}
        {/* platform */}
        {/* </p> */}
        {/* </div> */}
        {/* <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"> */}
        {/* <h3 className="text-lg font-semibold mb-3">Community Driven</h3> */}
        {/* <p className="text-gray-600"> */}
        {/* Be part of a vibrant community shaping the future of web3 content */}
        {/* </p> */}
        {/* </div> */}
        {/* <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"> */}
        {/* <h3 className="text-lg font-semibold mb-3">Seamless Experience</h3> */}
        {/* <p className="text-gray-600"> */}
        {/* Enjoy a smooth streaming experience built for the Farcaster */}
        {/* ecosystem */}
        {/* </p> */}
        {/* </div> */}
        {/* </div> */}

        {/* CTA Button */}
        {/* <a
          href="#"
          className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">
          Watch the Stream
        </a> */}
      </div>
    </div>
  );
}
