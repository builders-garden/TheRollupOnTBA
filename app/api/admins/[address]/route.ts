import { NextRequest, NextResponse } from "next/server";
import { deleteAdminByAddress } from "@/lib/database/queries/admins.query";

export const DELETE = async (
  _: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) => {
  const { address } = await params;

  // Validation
  if (!address) {
    return NextResponse.json(
      { success: false, error: "Address is required" },
      { status: 400 },
    );
  }

  // Delete the admin
  try {
    await deleteAdminByAddress(address);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete admin" },
      { status: 500 },
    );
  }
};
