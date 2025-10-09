import { NextRequest, NextResponse } from "next/server";
import { deleteHostByFidAndBrandId } from "@/lib/database/queries/hosts.query";

export const DELETE = async (
  _: NextRequest,
  { params }: { params: Promise<{ brandId: string; fid: string }> },
) => {
  const { brandId, fid } = await params;

  // Validation
  if (!fid || !brandId || isNaN(Number(fid))) {
    return NextResponse.json(
      { success: false, error: "FID and brand ID are required" },
      { status: 400 },
    );
  }

  // Delete the host
  try {
    await deleteHostByFidAndBrandId(Number(fid), brandId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete host error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete host" },
      { status: 500 },
    );
  }
};
