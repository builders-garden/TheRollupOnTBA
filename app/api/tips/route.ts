import { NextRequest, NextResponse } from "next/server";
import {
  createTipSettings,
  getTipSettingsByBaseName,
  getTipSettingsByBrand,
  getTipSettingsByEnsName,
  getTipSettingsByPayoutAddress,
} from "@/lib/database/queries";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const payoutAddress = searchParams.get("payoutAddress");
    const ensName = searchParams.get("ensName");
    const baseName = searchParams.get("baseName");

    let tip;

    if (payoutAddress) {
      tip = await getTipSettingsByPayoutAddress(payoutAddress);
    } else if (ensName) {
      tip = await getTipSettingsByEnsName(ensName);
    } else if (baseName) {
      tip = await getTipSettingsByBaseName(baseName);
    } else if (brandId) {
      tip = await getTipSettingsByBrand(brandId);
    } else {
      throw new Error("No tip identifier found");
    }

    return NextResponse.json({
      success: true,
      data: tip,
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

    const tip = await createTipSettings(data);

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
