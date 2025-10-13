import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { tipsTable, userTable } from "@/lib/database/db.schema";
import { getAdminsByBrandId } from "@/lib/database/queries/admins.query";
import { getBrandById } from "@/lib/database/queries/brand.query";

// Valid sort fields and their SQL expressions
const sortFields = {
  totalTips: (dir: "asc" | "desc") =>
    sql`count(${tipsTable.id}) ${sql.raw(dir)}`,
  totalAmount: (dir: "asc" | "desc") =>
    sql`sum(${tipsTable.amount}) ${sql.raw(dir)}`,
  firstTip: (dir: "asc" | "desc") =>
    sql`min(${tipsTable.createdAt}) ${sql.raw(dir)}`,
  lastTip: (dir: "asc" | "desc") =>
    sql`max(${tipsTable.createdAt}) ${sql.raw(dir)}`,
} as const;

type SortField = keyof typeof sortFields;

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

    // Extract pagination and sorting parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10")),
    );
    const offset = (page - 1) * limit;

    // Get sorting parameters
    const sortBy = searchParams.get("sortBy") as SortField;
    const sortDir = (searchParams.get("sortDir") || "desc") as "asc" | "desc";

    // Get total count for pagination
    const [{ count }] = await db
      .select({
        count: sql<number>`count(distinct ${userTable.id})`,
      })
      .from(tipsTable)
      .innerJoin(userTable, eq(tipsTable.senderId, userTable.id))
      .where(eq(tipsTable.receiverBrandId, brand.id));

    // Build the query
    const query = db
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
      .where(eq(tipsTable.receiverBrandId, brand.id))
      .groupBy(userTable.id);

    // Apply sorting if valid sort field is provided
    if (sortBy && sortBy in sortFields) {
      query.orderBy(sortFields[sortBy](sortDir));
    } else {
      // Default sorting
      query.orderBy(sortFields.totalAmount("desc"));
    }

    // Apply pagination
    const userTips = await query.limit(limit).offset(offset);

    return NextResponse.json({
      data: userTips,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + userTips.length < count,
      },
      sort: {
        field: sortBy || "totalAmount",
        direction: sortDir,
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
