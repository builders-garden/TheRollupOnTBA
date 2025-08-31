import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  // Create response
  const response = NextResponse.json({ success: true });

  // Clear the auth token cookie
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
};
