import { Errors } from "@farcaster/quick-auth";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserFromFid } from "@/lib/database/queries";
import { env } from "@/lib/zod";

export const POST = async (req: NextRequest) => {
  const { fid, referrerFid, connectedAddress } = await req.json();

  // Verify mandatory arguments
  if (!fid || isNaN(Number(fid)))
    return NextResponse.json(
      { success: false, error: "Invalid arguments" },
      { status: 400 },
    );

  try {
    const dbUser = await getOrCreateUserFromFid(
      Number(fid),
      referrerFid ? Number(referrerFid) : undefined,
      connectedAddress,
    );
    const primaryWallet = dbUser.wallets.find((wallet) => wallet.isPrimary);
    const walletAddress = dbUser.wallets[0].address;

    // Generate JWT token
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const exp = new Date(Date.now() + monthInMs);
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
