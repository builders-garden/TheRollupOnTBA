import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import { preconnect } from "react-dom";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farcaster Mini-app Starter by Builders Garden",
  description: "A starter for Farcaster mini-apps by Builders Garden",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://auth.farcaster.xyz");
  const cookie = (await headers()).get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} size-full antialiased`}>
        <Providers cookie={cookie}>
          {children}
          <Suspense>
            <Toaster />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
