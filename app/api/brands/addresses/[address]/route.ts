import { NextRequest, NextResponse } from "next/server";
import { getBrandByAddress } from "@/lib/database/queries";

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) => {
  try {
    const { address } = await params;
    const brand = await getBrandByAddress(address);

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Get brand error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch brand",
      },
      { status: 500 },
    );
  }
};
