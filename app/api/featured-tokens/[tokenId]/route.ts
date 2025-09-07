import { NextRequest, NextResponse } from "next/server";
import {
  deleteFeaturedToken,
  getFeaturedTokenById,
  toggleFeaturedTokenActiveStatus,
  updateFeaturedToken,
} from "@/lib/database/queries";

export const GET = async (
  _: NextRequest,
  { params }: { params: { tokenId: string } },
) => {
  try {
    const token = await getFeaturedTokenById(params.tokenId);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Featured token not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Get featured token error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured token",
      },
      { status: 500 },
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { tokenId: string } },
) => {
  try {
    const data = await req.json();
    const token = await updateFeaturedToken(params.tokenId, data);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Featured token not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Update featured token error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update featured token",
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _: NextRequest,
  { params }: { params: { tokenId: string } },
) => {
  try {
    const deleted = await deleteFeaturedToken(params.tokenId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Featured token not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Featured token deleted successfully",
    });
  } catch (error) {
    console.error("Delete featured token error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete featured token",
      },
      { status: 500 },
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { tokenId: string } },
) => {
  try {
    const { action } = await req.json();

    if (action === "toggle-active") {
      const token = await toggleFeaturedTokenActiveStatus(params.tokenId);

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: "Featured token not found",
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: token,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Patch featured token error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update featured token",
      },
      { status: 500 },
    );
  }
};
