import { NextRequest, NextResponse } from "next/server";
import {
  createBrand,
  getActiveBrands,
  getAllBrands,
  searchBrandsByName,
} from "@/lib/database/queries";
import {
  getBetaAccessKey,
  setBetaAccessKeyUsed,
} from "@/lib/database/queries/beta-access-key.query";

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
    if (!data.name || !data.slug || !data.betaAccessKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, slug, betaAccessKey",
        },
        { status: 400 },
      );
    }

    // Search the beta access key in the database
    const betaAccessKey = await getBetaAccessKey(data.betaAccessKey);

    // If the beta access key is not found, return an error
    if (!betaAccessKey || betaAccessKey.used) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized creation of a new brand",
        },
        { status: 401 },
      );
    }

    // Create a new brand in the database
    const brand = await createBrand(data);

    try {
      // Set the beta access key as used
      await setBetaAccessKeyUsed(data.betaAccessKey);
    } catch (error) {
      console.error("Set beta access key used error:", error);
    }

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
