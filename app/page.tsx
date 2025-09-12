import { Metadata } from "next";
import App from "@/components/pages/App/app";
import { env } from "@/lib/zod";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata(): Promise<Metadata> {
  const miniapp = {
    version: "next",
    imageUrl: `${appUrl}/images/feed.png`,
    button: {
      title: "Watch the Stream",
      action: {
        type: "launch_frame",
        name: "The Rollup",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };
  return {
    title: "The Rollup",
    description: "Enjoy The Rollup streams directly in mini app",
    metadataBase: new URL(appUrl),
    openGraph: {
      title: "The Rollup",
      description: "Enjoy The Rollup streams directly in mini app",
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
      title: "The Rollup",
      description: "Enjoy The Rollup streams directly in mini app",
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
  return <App />;
}
