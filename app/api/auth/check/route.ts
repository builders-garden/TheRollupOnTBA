import { NextRequest, NextResponse } from "next/server";
import { getBrandByAddress } from "@/lib/database/queries";
import { authenticateApi } from "@/lib/utils/authenticate-api";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid");
  const walletAddress = request.headers.get("x-user-wallet-address");

  // If there is no fid but a wallet address is present, it means the user is an admin
  // We need to return the brand linked to that address instead of the user
  if (!fid && walletAddress) {
    const brand = await getBrandByAddress(walletAddress);
    return NextResponse.json({ status: "ok", brand }, { status: 200 });
  }

  // Otherwise, we need to authenticate the user and return the user if everything is ok
  const {
    status,
    user: authUser,
    statusCode,
    error,
  } = await authenticateApi(fid, walletAddress);

  if (status === "nok" || error || !authUser) {
    if (error === "Unauthorized env") {
      return NextResponse.json({ status: "nok", error }, { status: 200 });
    }
    return NextResponse.json({ status: "nok", error }, { status: statusCode });
  }

  return NextResponse.json({ status: "ok", user: authUser }, { status: 200 });
}
