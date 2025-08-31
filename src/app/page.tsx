import { Metadata } from "next";
import { AppPage } from "@/components/pages";
import { env } from "@/lib/env";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata(): Promise<Metadata> {
  const miniapp = {
    version: "next",
    imageUrl: `${appUrl}/images/feed.png`,
    button: {
      title: "Launch App",
      action: {
        type: "launch_frame",
        name: "Mini-app Starter",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };
  return {
    title: "Farcaster Mini-app Starter by Builders Garden",
    description:
      "A starter template for Farcaster mini-apps by Builders Garden",
    metadataBase: new URL(appUrl),
    openGraph: {
      title: "Farcaster Mini-app Starter by Builders Garden",
      description:
        "A starter template for Farcaster mini-apps by Builders Garden",
      type: "website",
      images: [
        {
          url: `${appUrl}/feed.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Farcaster Mini-app Starter by Builders Garden",
      description:
        "A starter template for Farcaster mini-apps by Builders Garden",
      siteId: "1727435024931094528",
      creator: "@builders_garden",
      creatorId: "1727435024931094528",
      images: [`${appUrl}/feed.png`],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniapp),
    },
  };
}

export default function Home() {
  return <AppPage />;
}
