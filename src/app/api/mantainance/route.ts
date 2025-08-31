import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const isInMaintenance = env.NEXT_PUBLIC_IS_IN_MAINTENANCE;
  const oneHourMs = 1000 * 60 * 60;
  const maintenanceEndTime = env.NEXT_PUBLIC_MAINTENANCE_END_TIME
    ? new Date(env.NEXT_PUBLIC_MAINTENANCE_END_TIME).toISOString()
    : new Date(Date.now() + oneHourMs).toISOString();

  return NextResponse.json({ isInMaintenance, maintenanceEndTime });
}
