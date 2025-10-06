import { Errors } from "@farcaster/quick-auth";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { getOrCreateUserFromWalletAddress } from "@/lib/database/queries";
import { env } from "@/lib/zod";

const client = createPublicClient({
  chain: base,
  transport: http(),
});

export const POST = async (req: NextRequest) => {
  const { signature, address, message } = await req.json();

  // Verify mandatory arguments
  if (!signature || !address || !message)
    return NextResponse.json(
      { success: false, error: "Invalid arguments" },
      { status: 400 },
    );

  // Verify the signature
  const isValidSignature = await client.verifyMessage({
    address,
    message,
    signature,
  });

  // If the signature is not valid, return an error
  if (!isValidSignature)
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 401 },
    );

  try {
    const dbUser = await getOrCreateUserFromWalletAddress(address);

    // Generate JWT token
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const exp = new Date(Date.now() + monthInMs);
    const token = await new jose.SignJWT({
      fid: dbUser?.farcasterFid || null,
      walletAddress: address,
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
      name: "web_app_auth_token",
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
