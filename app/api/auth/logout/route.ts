import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  // Get the token type from the request body
  const { tokenType } = await req.json();

  const tokenToRemove =
    tokenType === "auth_token" ? "auth_token" : "web_app_auth_token";

  // Create response
  const response = NextResponse.json({ success: true });

  // Clear the auth token cookie
  response.cookies.set({
    name: tokenToRemove,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
};
