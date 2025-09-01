"use client";

import dynamic from "next/dynamic";

const AppContent = dynamic(() => import("@/components/pages/App/app-content"), {
  ssr: false,
  loading: () => <div />,
});

export default function App() {
  return <AppContent />;
}
