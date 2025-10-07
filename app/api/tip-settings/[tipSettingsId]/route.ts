import { NextRequest, NextResponse } from "next/server";
import {
  deleteTipSettings,
  getTipSettingsById,
  updateTipSettings,
} from "@/lib/database/queries";

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ tipSettingsId: string }> },
) => {
  try {
    const { tipSettingsId } = await params;
    const tipSettings = await getTipSettingsById(tipSettingsId);

    if (!tipSettings) {
      return NextResponse.json(
        {
          success: false,
          error: "Tip settings not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: tipSettings,
    });
  } catch (error) {
    console.error("Get tip settings error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tip settings",
      },
      { status: 500 },
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ tipSettingsId: string }> },
) => {
  try {
    const data = await req.json();
    const { tipSettingsId } = await params;
    const tipSettings = await updateTipSettings(tipSettingsId, data);

    if (!tipSettings) {
      return NextResponse.json(
        {
          success: false,
          error: "Tip settings not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: tipSettings,
    });
  } catch (error) {
    console.error("Update tip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update tip settings",
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _: NextRequest,
  { params }: { params: Promise<{ tipSettingsId: string }> },
) => {
  try {
    const { tipSettingsId } = await params;
    const deleted = await deleteTipSettings(tipSettingsId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Tip settings not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tip settings deleted successfully",
    });
  } catch (error) {
    console.error("Delete tip settings error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete tip settings",
      },
      { status: 500 },
    );
  }
};
