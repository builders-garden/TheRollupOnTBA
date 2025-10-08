import ky from "ky";
import { NextResponse } from "next/server";
import { env } from "@/lib/zod";

export async function GET() {
  try {
    // Get the current time from the socket server
    const timestamp = await ky
      .get<{ timestamp: number }>(`${env.NEXT_PUBLIC_SOCKET_URL}/current-time`)
      .json();

    // Return the timestamp
    return NextResponse.json(
      {
        timestamp: timestamp.timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    // If there is an error, return a 500 status code
    console.error("Get current time error:", error);
    return NextResponse.json({ timestamp: 0 }, { status: 500 });
  }
}
