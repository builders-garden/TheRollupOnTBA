import { NextRequest, NextResponse } from "next/server";
import {
  createHost,
  getHostsByBrandId,
} from "@/lib/database/queries/hosts.query";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");

    // Validation
    if (!brandId) {
      return NextResponse.json({
        success: false,
        error: "Brand ID is required",
      });
    }

    // Get the hosts by brand ID
    const hosts = await getHostsByBrandId(brandId);

    return NextResponse.json({
      success: true,
      data: hosts,
    });
  } catch (error) {
    console.error("Get hosts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch hosts",
      },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.fid || !data.brandId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: fid, brandId",
        },
        { status: 400 },
      );
    }

    const host = await createHost(data);

    return NextResponse.json({
      success: true,
      data: host,
    });
  } catch (error) {
    console.error("Create host error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create host",
      },
      { status: 500 },
    );
  }
};
