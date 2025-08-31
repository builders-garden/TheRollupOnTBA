"use client";

import dynamic from "next/dynamic";
import { Maintenance } from "@/components/pages/mantainance";
import { Website } from "@/components/pages/website";
import { useFarcaster } from "@/contexts/farcaster-context";
import { useMantainance } from "@/hooks/use-mantainance";
import { OverlayConfig, PageContent } from "@/types";

const App = dynamic(() => import("@/components/shared/app"), {
  ssr: false,
});

const AppWrapper = dynamic(() => import("@/components/shared/app-wrapper"), {
  ssr: false,
});

interface AppProps {
  initialPageContent?: PageContent;
  initialOverlayContent?: OverlayConfig;
}

export function AppPage({
  initialOverlayContent,
  initialPageContent,
}: AppProps) {
  const { context, isMiniAppReady } = useFarcaster();
  const { data: maintenanceData } = useMantainance();

  const isFromBrowser =
    (!context && isMiniAppReady) || (!context && !isMiniAppReady);

  // if (isFromBrowser) return <Website />;
  if (maintenanceData && maintenanceData.isInMantainance)
    return (
      <Maintenance
        maintenanceEnd={new Date(maintenanceData.mantainanceEndTime)}
      />
    );

  return (
    <App
      initialPageContent={initialPageContent}
      initialOverlayContent={initialOverlayContent}>
      <AppWrapper />
    </App>
  );
}
