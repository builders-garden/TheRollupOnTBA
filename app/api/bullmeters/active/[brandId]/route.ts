import { NextRequest, NextResponse } from "next/server";
import { getActiveBullMeterForBrandId } from "@/lib/database/queries";

export const dynamic = "force-dynamic";

/**
 * Get active bull meter for a brand ID
 * @param _req - The request
 * @returns The active bull meter
 */
export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) => {
  try {
    const { brandId } = await params;
    if (!brandId) {
      console.error("Brand ID is required");
      return NextResponse.json(
        {
          success: false,
          error: "Brand ID is required",
        },
        { status: 400 },
      );
    }

    let activeBullMeter = await getActiveBullMeterForBrandId(brandId);
    if (!activeBullMeter) {
      console.error("No active bull meter found for brand ID:", brandId);
      return NextResponse.json(
        {
          success: false,
          error: "No active bull meter found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: activeBullMeter,
    });
  } catch (error) {
    console.error("Get active bull meter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch active bull meters",
      },
      { status: 500 },
    );
  }
};
