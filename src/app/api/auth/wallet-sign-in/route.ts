import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { getOrCreateUserFromWalletAddress } from "@/lib/database/queries";
import { env } from "@/lib/env";
import { fetchUserByAddress } from "@/lib/neynar";
import { NeynarUser } from "@/types";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  try {
    const { address, message, signature } = await req.json();

    if (!address || !message || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify the signature
    const isValidSignature = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValidSignature) {
      console.error("Invalid signature", { address, message, signature });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    // Check if this wallet address has a Farcaster account
    let farcasterUser: NeynarUser | undefined = undefined;
    try {
      farcasterUser = await fetchUserByAddress(address);
    } catch (error) {
      // No Farcaster user found for this address, which is fine
    }

    // Create or update user in database
    const user = await getOrCreateUserFromWalletAddress(address, farcasterUser);

    // Generate JWT token
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const expirationTime = new Date(Date.now() + monthInMs);

    const token = await new jose.SignJWT({
      fid: farcasterUser?.fid || null,
      walletAddress: address,
      timestamp: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(secret);

    // Create the response
    const response = NextResponse.json({ success: true, user });

    // Set the auth cookie with the JWT token
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Wallet sign-in error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
