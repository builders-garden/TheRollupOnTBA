import { NextRequest, NextResponse } from "next/server";
import { countNotificationSubscriptionsByBrand } from "@/lib/database/queries/notification-subscriptions.query";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;

  if (!brandId) {
    return NextResponse.json(
      { error: "Brand ID is required", success: false },
      { status: 400 },
    );
  }

  try {
    const count = await countNotificationSubscriptionsByBrand(brandId);

    return NextResponse.json({ data: count, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in notification subscriptions count:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
