import { NextRequest, NextResponse } from "next/server";

// Simple proxy to The Rollup newsletter subscribe endpoint
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const upstream = await fetch(
      "https://therollup.co/api/newsletter/subscribe",
      {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );

    // Upstream might return JSON or plain text; normalize to JSON when possible
    const raw = await upstream.text();
    try {
      const json = JSON.parse(raw);
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      if (raw.includes("Member Exists")) {
        return NextResponse.json(
          { error: "Member Exists" },
          { status: upstream.status || 200 },
        );
      }
      return new NextResponse(raw, {
        status: upstream.status,
        headers: {
          "content-type": upstream.headers.get("content-type") || "text/plain",
        },
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
