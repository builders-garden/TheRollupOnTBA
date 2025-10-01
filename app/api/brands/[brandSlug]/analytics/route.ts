import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { brandsTable, tipsTable, userTable } from "@/lib/database/db.schema";
import { getAdminsByBrandId } from "@/lib/database/queries/admins.query";
import { authenticateApi } from "@/lib/utils/authenticate-api";

export async function GET(
  request: Request,
  { params }: { params: { brandSlug: string } },
) {
  try {
    // Get wallet address from headers
    const walletAddress = request.headers.get("x-wallet-address");
    const fid = request.headers.get("x-farcaster-fid");

    // Authenticate user
    const auth = await authenticateApi(fid, walletAddress);
    if (auth.status === "nok") {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode },
      );
    }

    // Get brand ID from slug
    const brand = await db
      .select({ id: brandsTable.id })
      .from(brandsTable)
      .where(eq(brandsTable.slug, params.brandSlug))
      .limit(1);

    if (!brand[0]) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if user is an admin for this brand
    const admins = await getAdminsByBrandId(brand[0].id);
    const isAdmin = admins.some(
      (admin) => admin.address.toLowerCase() === walletAddress?.toLowerCase(),
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Not an admin for this brand" },
        { status: 403 },
      );
    }

    // Extract pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10")),
    );
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [{ count }] = await db
      .select({
        count: sql<number>`count(distinct ${userTable.id})`,
      })
      .from(tipsTable)
      .innerJoin(userTable, eq(tipsTable.senderId, userTable.id))
      .where(eq(tipsTable.receiverBrandId, brand[0].id));

    // Get paginated tips for this brand with user information and aggregated amounts
    const userTips = await db
      .select({
        userId: userTable.id,
        username: userTable.username,
        farcasterUsername: userTable.farcasterUsername,
        farcasterDisplayName: userTable.farcasterDisplayName,
        farcasterAvatarUrl: userTable.farcasterAvatarUrl,
        totalTips: sql<number>`count(${tipsTable.id})`.as("totalTips"),
        totalAmount: sql<number>`sum(${tipsTable.amount})`.as("totalAmount"),
        firstTip: sql<string>`min(${tipsTable.createdAt})`.as("firstTip"),
        lastTip: sql<string>`max(${tipsTable.createdAt})`.as("lastTip"),
      })
      .from(tipsTable)
      .innerJoin(userTable, eq(tipsTable.senderId, userTable.id))
      .where(eq(tipsTable.receiverBrandId, brand[0].id))
      .groupBy(userTable.id)
      .orderBy(sql`totalAmount desc`)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: userTips,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + userTips.length < count,
      },
    });
  } catch (error) {
    console.error("Error in brand analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
