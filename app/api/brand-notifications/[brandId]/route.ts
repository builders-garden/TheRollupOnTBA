import { NextRequest, NextResponse } from "next/server";
import {
  createBrandNotification,
  getBrandNotificationsByBrandId,
  getBrandNotificationsCountByBrandId,
} from "@/lib/database/queries/brand-notifications";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) => {
  const { brandId } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10")),
  );
  const offset = (page - 1) * limit;

  if (!brandId) {
    return NextResponse.json(
      { error: "Brand ID is required" },
      { status: 400 },
    );
  }

  try {
    const count = await getBrandNotificationsCountByBrandId(brandId);

    const notifications = await getBrandNotificationsByBrandId(
      brandId,
      limit,
      offset,
    );

    return NextResponse.json(
      {
        success: true,
        data: notifications,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
          hasMore: offset + notifications.length < count,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get brand notifications error:", error);
    return NextResponse.json(
      { error: "Failed to get brand notifications" },
      { status: 500 },
    );
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) => {
  const { brandId } = await params;

  try {
    const data = await req.json();

    // Basic validation
    if (
      !data.title ||
      !data.body ||
      !data.targetUrl ||
      !data.totalTargetUsers ||
      !brandId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, body, targetUrl, totalTargetUsers, brandId",
        },
        { status: 400 },
      );
    }

    // Create the brand notification
    const newNotification = await createBrandNotification({ ...data, brandId });

    return NextResponse.json({
      success: true,
      data: newNotification,
    });
  } catch (error) {
    console.error("Create brand notification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create brand notification",
      },
      { status: 500 },
    );
  }
};
