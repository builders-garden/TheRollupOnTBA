import { NextRequest, NextResponse } from "next/server";
import { getUserFromId } from "@/lib/database/queries";
import { authenticateApi } from "@/lib/utils/authenticate-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const fid = request.headers.get("x-user-fid");
  const walletAddress = request.headers.get("x-user-wallet-address");

  // check if the user is authenticated
  const {
    status,
    user: authUser,
    statusCode,
    error,
  } = await authenticateApi(fid, walletAddress);

  if (status === "nok" || error || !authUser) {
    return NextResponse.json({ status: "nok", error }, { status: statusCode });
  }

  const { userId } = await params;
  const user = await getUserFromId(userId ?? "");

  // search user
  if (!user) {
    console.error("User id not found", userId);
    return NextResponse.json(
      { status: "nok", error: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: "ok", user }, { status: 200 });
}
