"use client";

import dynamic from "next/dynamic";
import { useMiniApp } from "@/contexts/mini-app-context";
import WebAppContent from "./web-app-content";

const MiniAppContent = dynamic(
  () => import("@/components/pages/App/mini-app-content"),
  {
    ssr: false,
    loading: () => <div />,
  },
);

export default function App({ brandSlug }: { brandSlug: string }) {
  const { isInMiniApp } = useMiniApp();

  // If we are in the miniapp, show the miniapp content
  if (isInMiniApp) {
    return <MiniAppContent brandSlug={brandSlug} />;
  }

  // If we are not in the miniapp, show the web app content
  return <WebAppContent brandSlug={brandSlug} />;
}
