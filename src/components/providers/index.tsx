"use client";

import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type State } from "wagmi";
import { ConditionalWagmiProvider } from "@/components/providers/conditional-wagmi-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { EnvironmentProvider } from "@/contexts/environment-context";
import { FarcasterProvider } from "@/contexts/farcaster-context";

const ErudaProvider = dynamic(
  () => import("./eruda").then((c) => c.ErudaProvider),
  { ssr: false },
);

export default function Providers({
  children,
  cookie,
}: {
  children: React.ReactNode;
  cookie: string | null;
}) {
  return (
    <EnvironmentProvider>
      <ErudaProvider>
        <PostHogProvider>
          <ConditionalWagmiProvider cookie={cookie}>
            <FarcasterProvider addMiniAppOnLoad={true}>
              <AuthProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
              </AuthProvider>
            </FarcasterProvider>
          </ConditionalWagmiProvider>
        </PostHogProvider>
      </ErudaProvider>
    </EnvironmentProvider>
  );
}
