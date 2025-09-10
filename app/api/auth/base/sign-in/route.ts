import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { getBrandByAddress } from "@/lib/database/queries";
import { env } from "@/lib/zod";

const client = createPublicClient({
  chain: base,
  transport: http(),
});

export const POST = async (req: NextRequest) => {
  try {
    console.log("TEST req", JSON.stringify(req, null, 2));
    const { address, message, signature, nonce } = await req.json();

    // Parameters validation
    if (!address || !message || !signature || !nonce) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Try to verify the signature using viem
    let isValidSignature = false;
    try {
      console.log("Attempting signature verification...");
      isValidSignature = await client.verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
      console.log("Standard verification result:", isValidSignature);
    } catch (standardError: any) {
      console.log("Standard verification failed:", standardError.message);
      console.log("Error name:", standardError.name);
      console.log("Error cause:", standardError.cause);
      return NextResponse.json(
        { success: false, error: "Invalid attempt to verify signature" },
        { status: 401 },
      );
    }

    // If the signature is not valid, return an error
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    // Get the brand from the database
    const brand = await getBrandByAddress(address);

    console.log("TEST brand", JSON.stringify(brand, null, 2));

    // Generate JWT token
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const expirationTime = new Date(Date.now() + monthInMs);

    const token = await new jose.SignJWT({
      walletAddress: address,
      timestamp: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(secret);

    // Create the response
    const response = NextResponse.json({ success: true, brand });

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
    console.error("Base sign-in error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
