import { like, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { bullMetersTable } from "@/lib/database/db.schema";

export const PATCH = async (req: NextRequest) => {
  try {
    const { pollId } = await req.json();

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

    // Find the poll by pollId in the prompt field
    const pollToUpdate = await db
      .select()
      .from(bullMetersTable)
      .where(like(bullMetersTable.prompt, `%$$$${pollId}`))
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

    // Update the poll to mark it as terminated
    // We can add a status field or use the existing fields to indicate termination
    const updatedPoll = await db
      .update(bullMetersTable)
      .set({
        // Set deadline to current time to mark as ended
        deadline: Math.floor(Date.now() / 1000),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(like(bullMetersTable.prompt, `%$$$${pollId}`))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedPoll[0],
    });
  } catch (error) {
    console.error("Terminate poll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to terminate poll",
      },
      { status: 500 },
    );
  }
};
