import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import Providers from "@/app/providers";
import { Toaster } from "@/components/shadcn-ui/sonner";
import "./globals.css";

const nunitoSans = Nunito_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farcaster Mini-app Starter by Builders Garden",
  description: "A starter for Farcaster mini-apps by Builders Garden",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await headers()).get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.className} size-full antialiased bg-background`}>
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
