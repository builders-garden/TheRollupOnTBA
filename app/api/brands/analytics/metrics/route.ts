import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { tipsTable } from "@/lib/database/db.schema";
import { getAdminsByBrandId } from "@/lib/database/queries/admins.query";
import { getBrandByAddress } from "@/lib/database/queries/brand.query";

export async function GET(request: Request) {
  try {
    // Get wallet address from headers
    const walletAddress = request.headers.get("x-user-wallet-address");

    const brand = await getBrandByAddress(walletAddress!);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if user is an admin for this brand
    const admins = await getAdminsByBrandId(brand.id);
    const isAdmin = admins.some(
      (admin) => admin.address.toLowerCase() === walletAddress?.toLowerCase(),
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Not an admin for this brand" },
        { status: 403 },
      );
    }

    // Get overall metrics in a single query
    const [metrics] = await db
      .select({
        totalTips: sql<number>`count(${tipsTable.id})`,
        totalAmount: sql<number>`sum(${tipsTable.amount})`,
        uniqueTippers: sql<number>`count(distinct ${tipsTable.senderId})`,
      })
      .from(tipsTable)
      .where(eq(tipsTable.receiverBrandId, brand.id));

    return NextResponse.json({
      data: {
        totalTips: metrics.totalTips || 0,
        totalAmount: metrics.totalAmount || 0,
        uniqueTippers: metrics.uniqueTippers || 0,
      },
    });
  } catch (error) {
    console.error("Error in brand analytics metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
