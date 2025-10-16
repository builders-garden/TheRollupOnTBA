import { NextRequest, NextResponse } from "next/server";
import { censorTextWithAI } from "@/lib/ai-censor";

export const POST = async (req: NextRequest) => {
  const { text } = await req.json();

  // Basic validation
  if (!text) {
    return NextResponse.json(
      { error: "Missing required field: text" },
      { status: 400 },
    );
  }

  try {
    const censoredText = await censorTextWithAI(text);
    return NextResponse.json({ censoredText }, { status: 200 });
  } catch (error) {
    console.error("Error censoring text with AI:", error);
    return NextResponse.json(
      { error: "Failed to censor text with AI" },
      { status: 500 },
    );
  }
};
