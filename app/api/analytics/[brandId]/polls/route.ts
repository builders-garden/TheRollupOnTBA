import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { bullMeterVotesTable, userTable } from "@/lib/database/db.schema";
import { getAdminsByBrandId } from "@/lib/database/queries/admins.query";
import { getBrandById } from "@/lib/database/queries/brand.query";

// Valid sort fields and their SQL expressions
const sortFields = {
  totalVotes: (dir: "asc" | "desc") =>
    sql`count(${bullMeterVotesTable.id}) ${sql.raw(dir)}`,
  totalAmount: (dir: "asc" | "desc") =>
    sql`sum(${bullMeterVotesTable.votePrice} * ${bullMeterVotesTable.votes}) ${sql.raw(dir)}`,
  firstVote: (dir: "asc" | "desc") =>
    sql`min(${bullMeterVotesTable.createdAt}) ${sql.raw(dir)}`,
  lastVote: (dir: "asc" | "desc") =>
    sql`max(${bullMeterVotesTable.createdAt}) ${sql.raw(dir)}`,
} as const;

type SortField = keyof typeof sortFields;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  try {
    // Get wallet address from headers and brand id from params
    const walletAddress = req.headers.get("x-user-wallet-address");
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
    const { searchParams } = new URL(req.url);
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
      .from(bullMeterVotesTable)
      .innerJoin(userTable, eq(bullMeterVotesTable.senderId, userTable.id))
      .where(eq(bullMeterVotesTable.receiverBrandId, brand.id));

    // Build the query
    const query = db
      .select({
        userId: userTable.id,
        username: userTable.username,
        farcasterUsername: userTable.farcasterUsername,
        farcasterDisplayName: userTable.farcasterDisplayName,
        farcasterAvatarUrl: userTable.farcasterAvatarUrl,
        totalVotes: sql<number>`count(${bullMeterVotesTable.id})`.as(
          "totalVotes",
        ),
        totalAmount:
          sql<number>`sum(${bullMeterVotesTable.votePrice} * ${bullMeterVotesTable.votes})`.as(
            "totalAmount",
          ),
        firstVote: sql<string>`min(${bullMeterVotesTable.createdAt})`.as(
          "firstVote",
        ),
        lastVote: sql<string>`max(${bullMeterVotesTable.createdAt})`.as(
          "lastVote",
        ),
      })
      .from(bullMeterVotesTable)
      .innerJoin(userTable, eq(bullMeterVotesTable.senderId, userTable.id))
      .where(eq(bullMeterVotesTable.receiverBrandId, brand.id))
      .groupBy(userTable.id);

    // Apply sorting if valid sort field is provided
    if (sortBy && sortBy in sortFields) {
      query.orderBy(sortFields[sortBy](sortDir));
    } else {
      // Default sorting
      query.orderBy(sortFields.totalAmount("desc"));
    }

    // Apply pagination
    const userVotes = await query.limit(limit).offset(offset);

    return NextResponse.json({
      data: userVotes,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + userVotes.length < count,
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
