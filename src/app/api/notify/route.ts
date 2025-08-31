import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllUsersNotificationDetails } from "@/lib/database/queries/user.query";
import { env } from "@/lib/env";
import { sendNotificationToAllUsers } from "@/lib/utils/farcaster-notification";

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  targetUrl: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("x-notification-secret");
    if (auth !== env.NOTIFICATION_SECRET) {
      console.error("Unauthorized api/notify request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );

    const users = await getAllUsersNotificationDetails();

    const result = await sendNotificationToAllUsers({
      title: parsed.data.title,
      body: parsed.data.body,
      targetUrl: parsed.data.targetUrl,
      users: users ?? undefined,
    });

    return NextResponse.json(
      {
        message: result.message,
        successfulTokens: result.successfulTokens,
        invalidTokens: result.invalidTokens,
        rateLimitedTokens: result.rateLimitedTokens,
        errorFids: result.errorFids,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
