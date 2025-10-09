import { NextRequest, NextResponse } from "next/server";
import { searchUsersByUsername } from "@/lib/neynar";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  try {
    const users = await searchUsersByUsername(username);
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error searching users by username", error);
    return NextResponse.json(
      { error: "Error searching users by username" },
      { status: 500 },
    );
  }
};
