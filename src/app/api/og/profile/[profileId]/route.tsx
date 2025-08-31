/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { DefaultOGImage } from "@/components/og-image/default-og-image";
import { ProfileOGImage } from "@/components/og-image/profile-og-image";
import { FARCASTER_EMBED_SIZE, OG_IMAGE_SIZE } from "@/lib/constants";
import { getUserFromId } from "@/lib/database/queries";
import { env } from "@/lib/env";
import { getFonts, getImageType, loadImage } from "@/lib/utils/og-image";

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

/**
 * GET handler for generating dynamic OpenGraph images
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the ID
 * @returns ImageResponse - A dynamically generated image for OpenGraph
 */
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      profileId: string;
    }>;
  },
) {
  try {
    const fonts = await getFonts();

    let width = OG_IMAGE_SIZE.width;
    let height = OG_IMAGE_SIZE.height;

    const aspectRatio = new URL(request.url).searchParams.get("ar");

    if (aspectRatio && aspectRatio === "3x2") {
      width = FARCASTER_EMBED_SIZE.width;
      height = FARCASTER_EMBED_SIZE.height;
    }
    const defaultResponse = new ImageResponse(
      <DefaultOGImage width={width} height={height} />,
      {
        width,
        height,
        fonts: fonts,
        debug: false,
        headers: [
          ["Cache-Control", "public, s-maxage=3600, stale-while-revalidate=59"], // cache in CDN for 1 hour, serve cache while revalidating
        ],
      },
    );

    // Extract the ID from the route parameters
    const { profileId: userId } = await params;
    if (!userId) {
      console.error("No ID provided");
      return defaultResponse;
    }

    const user = await getUserFromId(userId);
    if (!user) {
      console.error("User not found", userId);
      return defaultResponse;
    }

    // Load the logo image from the public directory
    const imageUrl = `${env.NEXT_PUBLIC_URL}/images/feed.png`;
    const imageType = getImageType(imageUrl);
    // satori only supports jpeg and png
    if (imageType !== "jpeg" && imageType !== "png") {
      console.error("Invalid image type", imageType);
      return defaultResponse;
    }
    const bgImage = await loadImage(imageUrl);

    // Generate and return the image response with the composed elements
    return new ImageResponse(
      (
        <ProfileOGImage
          user={user}
          coverImage={bgImage}
          coverImageType={imageType}
          width={width}
          height={height}
        />
      ),
      {
        width,
        height,
        fonts, // custom local font to use in the image
        debug: false,
        headers: [
          ["Cache-Control", "public, s-maxage=43200, stale-while-revalidate=0"], // cache in CDN for 12 hours
        ],
      },
    );
  } catch (e) {
    // Log and handle any errors during image generation
    console.error(`Failed to generate example image`, e);
    return new Response(`Failed to generate example image`, {
      status: 500,
    });
  }
}
