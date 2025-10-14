import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionByUserIdAndBrandId } from "@/lib/database/queries/notification-subscriptions.query";

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ userId: string; brandId: string }> },
) => {
  const { userId, brandId } = await params;

  if (!userId || !brandId) {
    return NextResponse.json(
      { error: "User ID and brand ID are required" },
      { status: 400 },
    );
  }

  try {
    const subscription = await getSubscriptionByUserIdAndBrandId(
      userId,
      brandId,
    );
    return NextResponse.json({ data: Boolean(subscription) }, { status: 200 });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 },
    );
  }
};
