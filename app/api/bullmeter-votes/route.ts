import { NextRequest, NextResponse } from "next/server";
import { createBullmeterVote } from "@/lib/database/queries";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (
      !data.pollId ||
      !data.senderId ||
      !data.receiverBrandId ||
      !data.votes ||
      !data.votePrice ||
      typeof data.isBull !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required field: pollId, senderId, receiverBrandId, votes, votePrice, isBull",
        },
        { status: 400 },
      );
    }

    const bullmeterVote = await createBullmeterVote(data);

    return NextResponse.json({
      success: true,
      data: bullmeterVote,
    });
  } catch (error) {
    console.error("Create bullmeter vote error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bullmeter vote",
      },
      { status: 500 },
    );
  }
};
