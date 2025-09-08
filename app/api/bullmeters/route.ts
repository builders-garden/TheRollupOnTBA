import { NextRequest, NextResponse } from "next/server";
import { CreateBullMeter } from "@/lib/database/db.schema";
import {
  createBullMeter,
  getAllBullMetersWithBrand,
  getBullMetersByBrand,
  getBullMetersByDuration,
  getRecentBullMeters,
} from "@/lib/database/queries";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const withBrand = searchParams.get("withBrand") === "true";
    const recent = searchParams.get("recent");
    const minDuration = searchParams.get("minDuration");
    const maxDuration = searchParams.get("maxDuration");
    const limit = searchParams.get("limit");

    let bullMeters;

    if (minDuration || maxDuration) {
      bullMeters = await getBullMetersByDuration(
        minDuration ? parseInt(minDuration) : undefined,
        maxDuration ? parseInt(maxDuration) : undefined,
      );
    } else if (brandId) {
      bullMeters = await getBullMetersByBrand(brandId);
    } else if (recent) {
      bullMeters = await getRecentBullMeters(parseInt(recent));
    } else if (withBrand) {
      bullMeters = await getAllBullMetersWithBrand(
        limit ? parseInt(limit) : undefined,
      );
    } else {
      bullMeters = await getRecentBullMeters(
        limit ? parseInt(limit) : undefined,
      );
    }

    return NextResponse.json({
      success: true,
      data: bullMeters,
    });
  } catch (error) {
    console.error("Get bull meters error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bull meters",
      },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data: CreateBullMeter = await req.json();

    // Basic validation
    if (!data.brandId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: brandId",
        },
        { status: 400 },
      );
    }

    const bullMeter = await createBullMeter(data);

    return NextResponse.json({
      success: true,
      data: bullMeter,
    });
  } catch (error) {
    console.error("Create bull meter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bull meter",
      },
      { status: 500 },
    );
  }
};
