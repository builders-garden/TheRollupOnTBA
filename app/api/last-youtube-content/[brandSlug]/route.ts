import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
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
        { success: false, error: "Brand slug is required" },
        { status: 400 },
      );
    }

    // Get the brand from the database
    const brand = await getBrandBySlug(brandSlug);

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    // Get the channel id from the brand
    const channelId = brand.youtubeChannelId;

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: "Channel ID not found" },
        { status: 404 },
      );
    }

    // Check if the live url expiration is in the past
    const liveUrlExpiration = brand.liveUrlExpiration;
    const isLiveUrlExpired = !!liveUrlExpiration
      ? new Date(liveUrlExpiration) < new Date()
      : true;

    // If cached live URL still valid, just return it
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
      // Try to fetch an active live event first
      const lastYoutubeContent = await ky
        .get<YoutubeContent>("https://www.googleapis.com/youtube/v3/search", {
          searchParams: {
            channelId,
            type: "video",
            part: "snippet",
            key: env.YOUTUBE_API_KEY,
            maxResults: 1,
            eventType: "live",
          },
        })
        .json();

      let youtubeLiveUrl: string;
      let title: string;

      if (lastYoutubeContent.items && lastYoutubeContent.items.length > 0) {
        console.log(
          "TEST: Live video found",
          JSON.stringify(lastYoutubeContent.items[0], null, 2),
        );
        // Case 1: Live video found
        youtubeLiveUrl = `https://www.youtube.com/embed/${lastYoutubeContent.items[0].id.videoId}`;
        title = lastYoutubeContent.items[0].snippet.title;
      } else {
        // Case 2: No live → fallback to RSS XML
        const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const xml = await ky.get(FEED_URL).text();
        const parsed = await parseStringPromise(xml);

        const entry = parsed.feed.entry?.[0];
        if (!entry) {
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

        const videoId = entry["yt:videoId"][0];
        title = entry.title[0];
        youtubeLiveUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      console.log("TEST: video found in XML", youtubeLiveUrl, title);

      // Save latest video/live in DB with short TTL
      await updateBrand(brandSlug, {
        youtubeLiveUrl,
        liveUrlExpiration: new Date(Date.now() + 1000 * 60 * 2).getTime(),
        streamTitle: title ?? `${brand.name} Streaming`,
      });

      return NextResponse.json(
        { success: true, data: { url: youtubeLiveUrl, title } },
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
      { success: false, error: "Failed to fetch youtube content" },
      { status: 500 },
    );
  }
};
