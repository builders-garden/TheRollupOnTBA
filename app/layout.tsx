import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import Providers from "@/app/providers";
import { Toaster } from "@/components/shadcn-ui/sonner";
import "./globals.css";
import { MiniAppProvider } from "@/contexts/mini-app-context";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});

const overusedGrotesk = localFont({
  src: "./fonts/overused-grotesk.woff2",
  variable: "--font-overused-grotesk",
});

export const metadata: Metadata = {
  title: "Control The Stream",
  description: "Parti",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${overusedGrotesk.variable} font-nunito-sans size-full antialiased bg-background`}>
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
