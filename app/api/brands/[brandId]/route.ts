import { NextRequest, NextResponse } from "next/server";
import {
  deleteBrand,
  getBrandById,
  toggleBrandActiveStatus,
  updateBrand,
} from "@/lib/database/queries";

export const GET = async (
  req: NextRequest,
  { params }: { params: { brandId: string } },
) => {
  try {
    const brand = await getBrandById(params.brandId);

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

export const PUT = async (
  req: NextRequest,
  { params }: { params: { brandId: string } },
) => {
  try {
    const data = await req.json();
    const brand = await updateBrand(params.brandId, data);

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
    console.error("Update brand error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update brand",
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { brandId: string } },
) => {
  try {
    const deleted = await deleteBrand(params.brandId);

    if (!deleted) {
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
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete brand error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete brand",
      },
      { status: 500 },
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { brandId: string } },
) => {
  try {
    const { action } = await req.json();

    if (action === "toggle-active") {
      const brand = await toggleBrandActiveStatus(params.brandId);

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
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Patch brand error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update brand",
      },
      { status: 500 },
    );
  }
};
