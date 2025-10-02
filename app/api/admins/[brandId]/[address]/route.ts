import { NextRequest, NextResponse } from "next/server";
import {
  deleteAdminByAddress,
  getAdminsByBrandId,
} from "@/lib/database/queries/admins.query";

export const DELETE = async (
  _: NextRequest,
  { params }: { params: Promise<{ brandId: string; address: string }> },
) => {
  const { brandId, address } = await params;

  // Validation
  if (!address || !brandId) {
    return NextResponse.json(
      { success: false, error: "Address is required" },
      { status: 400 },
    );
  }

  // Get the admins from the database
  const admin = await getAdminsByBrandId(brandId);

  // If the admin is not found, return an error
  if (
    admin.length === 0 ||
    !admin.some(
      (admin) => admin.address.toLowerCase() === address.toLowerCase(),
    )
  ) {
    return NextResponse.json(
      { success: false, error: "Admin not found" },
      { status: 404 },
    );
  }

  // If there is only one last admin, return an error
  if (admin.length === 1) {
    return NextResponse.json(
      { success: false, error: "Cannot delete the last admin" },
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
