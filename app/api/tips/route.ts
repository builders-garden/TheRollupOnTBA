import { NextRequest, NextResponse } from "next/server";
import {
  createTip,
  getAllTipsWithBrand,
  getRecentTips,
  getTipsByBaseName,
  getTipsByBrand,
  getTipsByEnsName,
  getTipsByPayoutAddress,
} from "@/lib/database/queries";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const withBrand = searchParams.get("withBrand") === "true";
    const recent = searchParams.get("recent");
    const payoutAddress = searchParams.get("payoutAddress");
    const ensName = searchParams.get("ensName");
    const baseName = searchParams.get("baseName");
    const limit = searchParams.get("limit");

    let tips;

    if (payoutAddress) {
      tips = await getTipsByPayoutAddress(payoutAddress);
    } else if (ensName) {
      tips = await getTipsByEnsName(ensName);
    } else if (baseName) {
      tips = await getTipsByBaseName(baseName);
    } else if (brandId) {
      tips = await getTipsByBrand(brandId);
    } else if (recent) {
      tips = await getRecentTips(parseInt(recent));
    } else if (withBrand) {
      tips = await getAllTipsWithBrand(limit ? parseInt(limit) : undefined);
    } else {
      tips = await getRecentTips(limit ? parseInt(limit) : undefined);
    }

    return NextResponse.json({
      success: true,
      data: tips,
    });
  } catch (error) {
    console.error("Get tips error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tips",
      },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.brandId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: brandId",
        },
        { status: 400 },
      );
    }

    const tip = await createTip(data);

    return NextResponse.json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error("Create tip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create tip",
      },
      { status: 500 },
    );
  }
};
