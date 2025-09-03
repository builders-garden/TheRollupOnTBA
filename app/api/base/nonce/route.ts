import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest ) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chainId = searchParams.get("chainId");
  
  // If the address is not valid, return an error
  if (!address ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // If the chainId is not valid, set it to the default chainId (Base mainnet - 8453)
  let verifiedChainId = chainId;
  if (!chainId) {
  verifiedChainId = "8453";
  }

  // calculate the nonce combining address, timestamp, chainId and a random string removing the dashes
  const nonce = `${address}-${Date.now()}-${verifiedChainId}-${crypto.randomUUID()}`.replace(/-/g, '');
  return NextResponse.json({ nonce });
}