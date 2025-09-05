import { NextRequest, NextResponse } from "next/server";
import { deleteTip, getTipById, updateTip } from "@/lib/database/queries";

export const GET = async (
  req: NextRequest,
  { params }: { params: { tipId: string } },
) => {
  try {
    const tip = await getTipById(params.tipId);

    if (!tip) {
      return NextResponse.json(
        {
          success: false,
          error: "Tip not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error("Get tip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tip",
      },
      { status: 500 },
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { tipId: string } },
) => {
  try {
    const data = await req.json();
    const tip = await updateTip(params.tipId, data);

    if (!tip) {
      return NextResponse.json(
        {
          success: false,
          error: "Tip not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error("Update tip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update tip",
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { tipId: string } },
) => {
  try {
    const deleted = await deleteTip(params.tipId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Tip not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tip deleted successfully",
    });
  } catch (error) {
    console.error("Delete tip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete tip",
      },
      { status: 500 },
    );
  }
};
