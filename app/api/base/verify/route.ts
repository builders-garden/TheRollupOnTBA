import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ 
  chain: base, 
  transport: http()
});

export const POST = async (req: NextRequest) => {
  try {
    const { address, message, signature, nonce } = await req.json();

    if (!address || !message || !signature || !nonce) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    let isValidSignature = false;
    // Try to verify the signature using viem
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
          { status: 401 }
        );
    }
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }
    // Create the response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Base sign-in error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
