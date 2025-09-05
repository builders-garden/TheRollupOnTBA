import { NextRequest, NextResponse } from "next/server";
import {
  deleteBullMeter,
  getBullMeterById,
  updateBullMeter,
} from "@/lib/database/queries";

export const GET = async (
  req: NextRequest,
  { params }: { params: { bullMeterId: string } },
) => {
  try {
    const bullMeter = await getBullMeterById(params.bullMeterId);

    if (!bullMeter) {
      return NextResponse.json(
        {
          success: false,
          error: "Bull meter not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: bullMeter,
    });
  } catch (error) {
    console.error("Get bull meter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bull meter",
      },
      { status: 500 },
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { bullMeterId: string } },
) => {
  try {
    const data = await req.json();
    const bullMeter = await updateBullMeter(params.bullMeterId, data);

    if (!bullMeter) {
      return NextResponse.json(
        {
          success: false,
          error: "Bull meter not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: bullMeter,
    });
  } catch (error) {
    console.error("Update bull meter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update bull meter",
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { bullMeterId: string } },
) => {
  try {
    const deleted = await deleteBullMeter(params.bullMeterId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Bull meter not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bull meter deleted successfully",
    });
  } catch (error) {
    console.error("Delete bull meter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete bull meter",
      },
      { status: 500 },
    );
  }
};
