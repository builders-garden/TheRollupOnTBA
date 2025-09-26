import { NextRequest, NextResponse } from "next/server";
import {
  createAdmin,
  getAdminsByBrandId,
} from "@/lib/database/queries/admins.query";

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

    // Get the admin addresses by brand ID
    const admins = await getAdminsByBrandId(brandId);

    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Get admins error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admins",
      },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.address || !data.brandId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: address, brandId",
        },
        { status: 400 },
      );
    }

    const admin = await createAdmin(data);

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin",
      },
      { status: 500 },
    );
  }
};
