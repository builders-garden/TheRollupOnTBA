import { NextRequest, NextResponse } from "next/server";
import {
  createNotificationSubscription,
  deleteNotificationSubscription,
  getSubscriptionByUserIdAndBrandId,
} from "@/lib/database/queries/notification-subscriptions.query";

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
    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 },
    );
  }
};

export const POST = async (
  _: NextRequest,
  { params }: { params: Promise<{ brandId: string; userId: string }> },
) => {
  const { brandId, userId } = await params;

  if (!brandId || !userId) {
    return NextResponse.json(
      { error: "Brand ID and user ID are required" },
      { status: 400 },
    );
  }

  try {
    const result = await createNotificationSubscription(brandId, userId);

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("Create notification subscription error:", error);
    return NextResponse.json(
      { error: "Failed to create notification subscription" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _: NextRequest,
  { params }: { params: Promise<{ brandId: string; userId: string }> },
) => {
  const { brandId, userId } = await params;

  if (!brandId || !userId) {
    return NextResponse.json(
      { error: "Brand ID and user ID are required" },
      { status: 400 },
    );
  }

  try {
    const result = await deleteNotificationSubscription(brandId, userId);
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("Delete notification subscription error:", error);
    return NextResponse.json(
      { error: "Failed to delete notification subscription" },
      { status: 500 },
    );
  }
};
