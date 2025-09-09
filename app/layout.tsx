import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { Suspense } from "react";
import Providers from "@/app/providers";
import { Toaster } from "@/components/shadcn-ui/sonner";
import "./globals.css";
import { MiniAppProvider } from "@/contexts/mini-app-context";

const nunitoSans = Nunito_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Rollup Streaming Service",
  description: "A streaming service for The Rollup",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.className} size-full antialiased bg-background`}>
        <MiniAppProvider addMiniAppOnLoad={true}>
          <Providers>
            {children}
            <Suspense>
              <Toaster richColors position="top-right" />
            </Suspense>
          </Providers>
        </MiniAppProvider>
      </body>
    </html>
  );
}
