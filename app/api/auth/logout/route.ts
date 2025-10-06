import { NextRequest, NextResponse } from "next/server";
import { AuthTokenType } from "@/lib/enums";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  // Get the token type from the request body
  const { tokenType } = await req.json();

  const tokenToRemove =
    tokenType === AuthTokenType.WEB_APP_AUTH_TOKEN
      ? AuthTokenType.WEB_APP_AUTH_TOKEN
      : tokenType === AuthTokenType.MINI_APP_AUTH_TOKEN
        ? AuthTokenType.MINI_APP_AUTH_TOKEN
        : AuthTokenType.ADMIN_AUTH_TOKEN;

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
