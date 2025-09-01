import { createClient, Errors } from "@farcaster/quick-auth";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserFromFid } from "@/lib/database/queries";
import { userIsNotAdminAndIsNotProduction } from "@/lib/utils";
import { env } from "@/lib/zod";

const quickAuthClient = createClient();

export const POST = async (req: NextRequest) => {
  const {
    token: farcasterToken,
    fid: contextFid,
    referrerFid,
  } = await req.json();
  if (!farcasterToken || !contextFid || isNaN(Number(contextFid)))
    return NextResponse.json(
      { success: false, error: "Invalid arguments" },
      { status: 400 },
    );

  // Verify signature matches custody address and auth address
  try {
    const payload = await quickAuthClient.verifyJwt({
      domain: new URL(env.NEXT_PUBLIC_URL).hostname,
      token: farcasterToken,
    });
    const fid = payload.sub;
    if (!payload || !fid || isNaN(Number(fid)) || fid !== contextFid) {
      console.error("Invalid token for fid", fid, "contextFid", contextFid);
      return NextResponse.json(
        { success: false, error: "Invalid" },
        { status: 401 },
      );
    }

    if (userIsNotAdminAndIsNotProduction(Number(fid))) {
      console.error("User is not admin and this is not production", {
        fid,
      });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const dbUser = await getOrCreateUserFromFid(
      Number(fid),
      referrerFid ? Number(referrerFid) : undefined,
    );
    const primaryWallet = dbUser.wallets.find((wallet) => wallet.isPrimary);
    const walletAddress = dbUser.wallets[0].address;

    // Generate JWT token
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const exp = payload.exp
      ? new Date(Number(payload.exp) * 1000 + monthInMs)
      : new Date(Date.now() + monthInMs);
    const token = await new jose.SignJWT({
      fid,
      walletAddress: primaryWallet ? primaryWallet.address : walletAddress,
      timestamp: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(secret);

    const response = NextResponse.json(
      { success: true, user: dbUser },
      { status: 200 },
    );

    // Set the auth cookie with the JWT token
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: monthInMs / 1000, // 30 days in seconds
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Sign-in error:", e);
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    throw e;
  }
};
