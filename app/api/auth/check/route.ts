import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/utils/authenticate-api";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid");
  const walletAddress = request.headers.get("x-user-wallet-address");

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
