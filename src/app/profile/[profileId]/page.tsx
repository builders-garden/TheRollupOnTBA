import { Metadata } from "next";
import { AppPage } from "@/components/pages";
import { OG_IMAGE_SIZE } from "@/lib/constants";
import { env } from "@/lib/env";
import { OverlayContent } from "@/types";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { profileId } = await params;
  const _searchParams = await searchParams;
  const searchParamsString = Object.entries(_searchParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const ogTitle = "Starter";
  const ogDescription = "Farcaster Starter";

  const ogImageUrl = profileId
    ? `${appUrl}/api/og/profile/${profileId}`
    : `${appUrl}/images/feed.png`;
  const farcasterImageUrl = profileId
    ? `${appUrl}/api/og/profile/${profileId}?ar=3x2`
    : `${appUrl}/images/feed.png`;

  const miniapp = {
    version: "next",
    imageUrl: farcasterImageUrl,
    button: {
      title: profileId ? "See Profile" : "Launch Starter",
      action: {
        type: "launch_frame",
        name: "Starter",
        url: `${appUrl}/profile/${profileId}${searchParamsString ? `?${searchParamsString}` : ""}`,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };

  return {
    title: ogTitle,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      siteId: "1727435024931094528",
      creator: "@builders_garden",
      creatorId: "1727435024931094528",
      images: [ogImageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniapp),
    },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  return (
    <AppPage
      initialOverlayContent={{
        type: OverlayContent.VIEW_PROFILE,
        userId: profileId,
      }}
    />
  );
}
