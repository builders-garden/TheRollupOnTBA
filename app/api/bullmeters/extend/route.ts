import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { bullMetersTable } from "@/lib/database/db.schema";

export const PATCH = async (req: NextRequest) => {
  try {
    const { pollId, newDuration, newDeadline } = await req.json();

    // Basic validation
    if (!pollId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: pollId",
        },
        { status: 400 },
      );
    }

    if (!newDuration || !newDeadline) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: newDuration, newDeadline",
        },
        { status: 400 },
      );
    }

    // Find the poll by pollId in the prompt field
    const pollToUpdate = await db
      .select()
      .from(bullMetersTable)
      .where(eq(bullMetersTable.pollId, pollId))
      .limit(1);

    if (pollToUpdate.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll not found",
        },
        { status: 404 },
      );
    }

    // Update the poll with new duration and deadline
    const updatedPoll = await db
      .update(bullMetersTable)
      .set({
        duration: newDuration,
        deadline: newDeadline,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(bullMetersTable.pollId, pollId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedPoll[0],
    });
  } catch (error) {
    console.error("Extend poll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to extend poll",
      },
      { status: 500 },
    );
  }
};
