import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminsByBrandId } from "@/lib/database/queries/admins.query";
import { getAllSubscribedUsersToBrand } from "@/lib/database/queries/user.query";
import { sendNotificationToUsers } from "@/lib/utils/farcaster-notification";

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  targetUrl: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  // Get wallet address from headers and brand id from params
  const walletAddress = req.headers.get("x-user-wallet-address");
  const { brandId } = await params;
  const body = await req.json();

  console.log("[notify/brandId] walletAddress", walletAddress);
  console.log("[notify/brandId] brandId", brandId);
  console.log("[notify/brandId] body", body);

  if (!brandId || !walletAddress || !body) {
    return NextResponse.json(
      { error: "Brand ID, wallet address and body are required" },
      { status: 400 },
    );
  }

  // Verify the request body
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.log("[notify/brandId] parsed error");
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    // Check if user is an admin for this brand
    const admins = await getAdminsByBrandId(brandId);
    const isAdmin = admins.some(
      (admin) => admin.address.toLowerCase() === walletAddress?.toLowerCase(),
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Not an admin for this brand" },
        { status: 403 },
      );
    }

    // Get all the subscribed users to the brand that have a Farcaster ID and notification details
    const users = (await getAllSubscribedUsersToBrand(brandId)).filter(
      (user) => !!user.farcasterFid && !!user.farcasterNotificationDetails,
    );

    const result = await sendNotificationToUsers({
      title: parsed.data.title,
      body: parsed.data.body,
      targetUrl: parsed.data.targetUrl,
      users: users.map((user) => ({
        farcasterFid: user.farcasterFid!,
        farcasterNotificationDetails: user.farcasterNotificationDetails!,
      })),
    });

    return NextResponse.json(
      {
        message: result.message,
        successfulTokens: result.successfulTokens,
        invalidTokens: result.invalidTokens,
        rateLimitedTokens: result.rateLimitedTokens,
        errorFids: result.errorFids,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[notify/brandId] error", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
