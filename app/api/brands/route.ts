import { NextRequest, NextResponse } from "next/server";
import {
  createBrand,
  getActiveBrands,
  getAllBrands,
  searchBrandsByName,
} from "@/lib/database/queries";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    let brands;

    if (search) {
      brands = await searchBrandsByName(search, activeOnly);
    } else if (activeOnly) {
      brands = await getActiveBrands();
    } else {
      brands = await getAllBrands(limit ? parseInt(limit) : undefined);
    }

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Get brands error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch brands",
      },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.name || !data.slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, walletAddresses",
        },
        { status: 400 },
      );
    }

    const brand = await createBrand(data);

    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Create brand error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create brand",
      },
      { status: 500 },
    );
  }
};
