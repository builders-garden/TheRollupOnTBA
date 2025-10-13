import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { bullMeterVotesTable } from "@/lib/database/db.schema";
import { getAdminsByBrandId } from "@/lib/database/queries/admins.query";
import { getBrandById } from "@/lib/database/queries/brand.query";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  try {
    // Get wallet address from headers and brand id from params
    const walletAddress = request.headers.get("x-user-wallet-address");
    const { brandId } = await params;

    if (!brandId || !walletAddress) {
      return NextResponse.json(
        { error: "Brand ID and wallet address are required" },
        { status: 400 },
      );
    }

    const brand = await getBrandById(brandId);

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
        totalVotes: sql<number>`count(${bullMeterVotesTable.id})`,
        totalAmount: sql<number>`sum(${bullMeterVotesTable.votePrice} * ${bullMeterVotesTable.votes})`,
        uniqueVoters: sql<number>`count(distinct ${bullMeterVotesTable.senderId})`,
      })
      .from(bullMeterVotesTable)
      .where(eq(bullMeterVotesTable.receiverBrandId, brand.id));

    return NextResponse.json({
      data: {
        totalVotes: metrics.totalVotes || 0,
        totalAmount: metrics.totalAmount || 0,
        uniqueVoters: metrics.uniqueVoters || 0,
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
