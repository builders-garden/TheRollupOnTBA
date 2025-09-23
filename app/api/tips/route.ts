import { NextRequest, NextResponse } from "next/server";
import { createTip } from "@/lib/database/queries";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.senderId || !data.receiverBrandId || !data.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: senderId, receiverBrandId, amount",
        },
        { status: 400 },
      );
    }

    console.log("Create tip data:", data);

    const tip = await createTip(data);

    return NextResponse.json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error("Create tip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create tip",
      },
      { status: 500 },
    );
  }
};
