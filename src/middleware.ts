import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { env } from "./lib/env";

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(req: NextRequest) {
  // Skip auth check for sign-in endpoint
  if (
    req.nextUrl.pathname === "/api/auth/sign-in" ||
    req.nextUrl.pathname === "/api/auth/wallet-sign-in" ||
    req.nextUrl.pathname === "/api/auth/logout" ||
    req.nextUrl.pathname.includes("/api/og") ||
    req.nextUrl.pathname.includes("/api/webhook/farcaster")
  ) {
    return NextResponse.next();
  }

  // Get token from auth_token cookie
  const authToken = req.cookies.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    // Verify the token using jose
    const { payload } = await jose.jwtVerify(authToken, secret);

    // Clone the request headers to add user info
    const requestHeaders = new Headers(req.headers);
    if (payload.fid !== null && payload.fid !== undefined) {
      requestHeaders.set("x-user-fid", payload.fid as string);
    }
    // Always set wallet address if it exists (even for users without Farcaster accounts)
    if (payload.walletAddress) {
      requestHeaders.set(
        "x-user-wallet-address",
        payload.walletAddress as string,
      );
    }

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error(error);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-user-fid");
    requestHeaders.delete("x-user-wallet-address");

    return NextResponse.json(
      { error: "Invalid token" },
      {
        status: 401,
        headers: requestHeaders,
      },
    );
  }
}
