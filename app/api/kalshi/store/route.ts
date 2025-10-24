import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreateKalshiEvent } from "@/lib/database/db.schema";
import { getBrandById } from "@/lib/database/queries/brand.query";
import {
  createKalshiEvent,
  kalshiEventExists,
} from "@/lib/database/queries/kalshi.queries";

// Validation schema for the request body
const storeKalshiSchema = z.object({
  brandId: z.string().min(1),
  kalshiData: z.object({
    eventTitle: z.string().min(1),
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

    // Verify brand exists
    const brand = await getBrandById(brandId);
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    // TODO: Return success response MOCK DATA
    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Brand found",
        },
      },
      { status: 200 },
    );

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
    const eventData: CreateKalshiEvent = {
      brandId,
      kalshiEventId,
      kalshiUrl,
      eventTitle: kalshiData.eventTitle,
      totalMarkets: kalshiData.totalMarkets,
    };

    // Create the event
    const result = await createKalshiEvent(eventData);

    return NextResponse.json({
      success: true,
      data: {
        eventId: result.id,
        totalMarkets: result.totalMarkets,
        message: "Kalshi event stored successfully",
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
