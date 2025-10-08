import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse(JSON.stringify({ serverNowMs: Date.now() }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
