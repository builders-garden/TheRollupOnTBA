/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { BrandOGImage } from "@/components/og-image/brand-og-image";
import { DefaultOGImage } from "@/components/og-image/default-og-image";
import { FARCASTER_EMBED_SIZE, OG_IMAGE_SIZE } from "@/lib/constants";
import { getBrandBySlug } from "@/lib/database/queries";
import { getFonts, getImageType, loadImage } from "@/lib/utils/og-image";
import { env } from "@/lib/zod";

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
      brandSlug: string;
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

    const { brandSlug } = await params;
    const brand = await getBrandBySlug(brandSlug);

    if (!brand) {
      console.error(`Brand not found: ${brandSlug}`);
      return defaultResponse;
    }

    const bgImageUrl = brand.coverUrl;
    let bgImageType;
    let bgImage;

    if (bgImageUrl) {
      bgImageType = getImageType(bgImageUrl);
      // satori only supports jpeg and png
      if (bgImageType !== "jpeg" && bgImageType !== "png") {
        console.error("Invalid image type", bgImageType);
        return defaultResponse;
      }
      bgImage = await loadImage(bgImageUrl);
    }

    // Generate and return the image response with the composed elements
    return new ImageResponse(
      (
        <BrandOGImage
          brand={brand}
          coverImage={bgImage}
          coverImageType={bgImageType}
          width={width}
          height={height}
        />
      ),
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
  } catch (e) {
    // Log and handle any errors during image generation
    console.error(`Failed to generate game og image`, e);
    return new ImageResponse(
      (
        <DefaultOGImage
          width={OG_IMAGE_SIZE.width}
          height={OG_IMAGE_SIZE.height}
        />
      ),
      {
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
        debug: false,
        headers: [
          ["Cache-Control", "public, s-maxage=3600, stale-while-revalidate=59"], // cache in CDN for 1 hour, serve cache while revalidating
        ],
      },
    );
  }
}
