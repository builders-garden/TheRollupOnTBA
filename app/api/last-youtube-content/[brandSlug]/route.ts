import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
import { getBrandBySlug, updateBrand } from "@/lib/database/queries";
import { YoutubeContent } from "@/lib/types/youtube-content.type";
import { env } from "@/lib/zod";

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ brandSlug: string }> },
) => {
  try {
    const { brandSlug } = await params;

    if (!brandSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand slug is required",
        },
        { status: 400 },
      );
    }

    // Get the brand from the database
    const brand = await getBrandBySlug(brandSlug);

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand not found",
        },
        { status: 404 },
      );
    }

    // Get the channel id from the brand
    const channelId = brand.youtubeChannelId;

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,
          error: "Channel ID not found",
        },
        { status: 404 },
      );
    }

    // Check if the live url expiration is in the past
    const liveUrlExpiration = brand.liveUrlExpiration;
    const isLiveUrlExpired = !!liveUrlExpiration
      ? new Date(liveUrlExpiration) < new Date()
      : true;

    // If the live url is not expired, return the live url from the database
    if (!isLiveUrlExpired) {
      if (!brand.youtubeLiveUrl) {
        // If the live url is not found, return the live url generated from the channel id
        return NextResponse.json(
          {
            success: true,
            data: {
              url: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
              title: `${brand.name} Streaming`,
            },
          },
          { status: 200 },
        );
      }

      // If the live url is found, return the live url from the database
      return NextResponse.json(
        {
          success: true,
          data: {
            url: brand.youtubeLiveUrl,
            title: brand.streamTitle,
          },
        },
        { status: 200 },
      );
    }

    try {
      // If the live url is expired, fetch the last youtube content
      const lastYoutubeContent = await ky
        .get<YoutubeContent>("https://www.googleapis.com/youtube/v3/search", {
          searchParams: {
            channelId,
            type: "video",
            part: "snippet",
            key: env.YOUTUBE_API_KEY,
            maxResults: 1,
          },
        })
        .json();

      console.log(
        "TEST lastYoutubeContent",
        JSON.stringify(lastYoutubeContent, null, 2),
      );

      // Generate the youtube live url
      const youtubeLiveUrl = `https://www.youtube.com/embed/${lastYoutubeContent.items[0].id.videoId}`;

      // Get the title of the last youtube content
      const title = lastYoutubeContent.items[0].snippet.title;

      // Update the live url in the database
      await updateBrand(brandSlug, {
        youtubeLiveUrl: youtubeLiveUrl,
        liveUrlExpiration: new Date(Date.now() + 1000 * 60 * 2).getTime(), // 2 minutes ahead of now in unix timestamp
        streamTitle: title ?? `${brand.name} Streaming`,
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            url: youtubeLiveUrl,
            title: title ?? `${brand.name} Streaming`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      // If the google endpoint is not working, return the live url generated from the channel id
      return NextResponse.json(
        {
          success: true,
          data: {
            url: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
            title: `${brand.name} Streaming`,
          },
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Get youtube content error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch youtube content",
      },
      { status: 500 },
    );
  }
};
