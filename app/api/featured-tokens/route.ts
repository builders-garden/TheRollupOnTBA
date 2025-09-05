import { NextRequest, NextResponse } from "next/server";
import {
  createFeaturedToken,
  getActiveFeaturedTokens,
  getAllFeaturedTokensWithBrand,
  getFeaturedTokenByAddress,
  getFeaturedTokensByBrand,
  getFeaturedTokensByChain,
  searchFeaturedTokens,
} from "@/lib/database/queries";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const chainId = searchParams.get("chainId");
    const activeOnly = searchParams.get("active") === "true";
    const withBrand = searchParams.get("withBrand") === "true";
    const search = searchParams.get("search");
    const address = searchParams.get("address");
    const limit = searchParams.get("limit");

    let tokens;

    if (address) {
      tokens = await getFeaturedTokenByAddress(
        address,
        chainId ? parseInt(chainId) : undefined,
      );
      // Return single token as array for consistency
      tokens = tokens ? [tokens] : [];
    } else if (search) {
      tokens = await searchFeaturedTokens(search, activeOnly);
    } else if (chainId) {
      tokens = await getFeaturedTokensByChain(parseInt(chainId), activeOnly);
    } else if (brandId) {
      tokens = await getFeaturedTokensByBrand(brandId, activeOnly);
    } else if (activeOnly && !withBrand) {
      tokens = await getActiveFeaturedTokens();
    } else if (withBrand) {
      tokens = await getAllFeaturedTokensWithBrand(
        activeOnly,
        limit ? parseInt(limit) : undefined,
      );
    } else {
      tokens = await getAllFeaturedTokensWithBrand(
        false,
        limit ? parseInt(limit) : undefined,
      );
    }

    return NextResponse.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error("Get featured tokens error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured tokens",
      },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.brandId || !data.name || !data.symbol) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: brandId, name, symbol",
        },
        { status: 400 },
      );
    }

    const token = await createFeaturedToken(data);

    return NextResponse.json({
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Create featured token error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create featured token",
      },
      { status: 500 },
    );
  }
};
