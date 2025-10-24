import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreateKalshiMarket } from "@/lib/database/db.schema";
import { getAdminsByBrandId } from "@/lib/database/queries/admins.query";
import { getBrandById } from "@/lib/database/queries/brand.query";
import {
  createKalshiEventWithMarkets,
  kalshiEventExists,
} from "@/lib/database/queries/kalshi.queries";
import { KalshiApiSuccess } from "@/lib/types/kalshi.type";

// Validation schema for the request body
const storeKalshiSchema = z.object({
  brandId: z.string().min(1),
  kalshiData: z.object({
    eventTitle: z.string().min(1),
    markets: z.array(
      z.object({
        title: z.string().min(1),
        yesPrice: z.string().min(1),
        noPrice: z.string().min(1),
        status: z.string().min(1),
        ticker: z.string().min(1),
        noSubTitle: z.string().min(1),
      }),
    ),
    totalMarkets: z.number().min(1),
  }),
  kalshiUrl: z.string().url(),
});

export const POST = async (req: NextRequest) => {
  try {
    // Get wallet address from headers
    const walletAddress = req.headers.get("x-user-wallet-address");
    const body = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 },
      );
    }

    // Validate request body
    const parsed = storeKalshiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.message },
        { status: 400 },
      );
    }

    const { brandId, kalshiData, kalshiUrl } = parsed.data;
    console.log("brandId", brandId);
    console.log("kalshiData", kalshiData);
    console.log("kalshiUrl", kalshiUrl);

    // Verify brand exists
    const brand = await getBrandById(brandId);
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        eventId: "123", // TODO: Replace with actual event ID
        marketsCount: 1, // TODO: Replace with actual markets count
        message: "Kalshi event and markets stored successfully",
      },
    });

    

    // Extract event ID from URL for uniqueness check
    const urlParts = kalshiUrl.split("/");
    const kalshiEventId = urlParts[urlParts.length - 1]?.toUpperCase();

    if (!kalshiEventId) {
      return NextResponse.json(
        { success: false, error: "Invalid Kalshi URL format" },
        { status: 400 },
      );
    }

    // Check if this event already exists for this brand
    const eventExists = await kalshiEventExists(brandId, kalshiEventId);
    if (eventExists) {
      return NextResponse.json(
        {
          success: false,
          error: "This Kalshi event is already stored for this brand",
        },
        { status: 409 },
      );
    }

    // Prepare event data
    const eventData = {
      brandId,
      kalshiEventId,
      kalshiUrl,
      eventTitle: kalshiData.eventTitle,
      eventStatus: "active", // Default status
      totalMarkets: kalshiData.totalMarkets,
      category: "Politics", // Default category - could be extracted from API response
      subTitle: "", // Could be extracted from API response
      strikeDate: null, // Could be extracted from API response
      mutuallyExclusive: false, // Default value
    };

    // Prepare markets data
    const marketsData: Omit<CreateKalshiMarket, "eventId">[] =
      kalshiData.markets.map((market) => {
        const yesPercentage = Math.round(parseFloat(market.yesPrice) * 100);
        const noPercentage = 100 - yesPercentage;

        return {
          kalshiMarketTicker: market.ticker,
          kalshiMarketTitle: market.title,
          candidateName: market.noSubTitle, // Using noSubTitle as candidate name
          affiliation: "", // Could be extracted from API response
          yesPercentage,
          noPercentage,
          yesPrice: market.yesPrice,
          noPrice: market.noPrice,
          marketStatus: market.status,
          marketType: "binary", // Default for Kalshi markets
          closeTime: null, // Could be extracted from API response
          expirationTime: null, // Could be extracted from API response
          volume: null, // Could be extracted from API response
          liquidity: null, // Could be extracted from API response
          openInterest: null, // Could be extracted from API response
        };
      });

    // Create the event with markets
    const result = await createKalshiEventWithMarkets(
      eventData,
      marketsData as CreateKalshiMarket[],
    );

    return NextResponse.json({
      success: true,
      data: {
        eventId: "123", // TODO: Replace with actual event ID
        marketsCount: 1, // TODO: Replace with actual markets count
        message: "Kalshi event and markets stored successfully",
      },
    });
  } catch (error) {
    console.error("Error storing Kalshi event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
