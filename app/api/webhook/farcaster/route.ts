import {
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";
import { NextRequest } from "next/server";
import {
  deleteUserNotificationDetails,
  getOrCreateUserFromFid,
  setUserNotificationDetails,
} from "@/lib/database/queries";
import { sendFarcasterNotification } from "@/lib/utils/farcaster-notification";

export async function POST(request: NextRequest) {
  const requestJson = await request.json();
  console.log("[webhook/farcaster] requestJson", requestJson);

  let data;
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 400 },
        );
      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 401 },
        );
      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key (caller may want to try again)
        return Response.json(
          { success: false, error: error.message },
          { status: 500 },
        );
    }
  }

  console.log("[webhook/farcaster] parsed event data", data);
  const fid = data.fid;
  const event = data.event;
  await getOrCreateUserFromFid(fid);

  switch (event.event) {
    case "miniapp_added":
      if (event.notificationDetails) {
        await setUserNotificationDetails(fid, event.notificationDetails);
        await sendFarcasterNotification({
          fid,
          title: `Welcome to Control the Stream!`,
          body: `Enjoy your favourite streams and interact with them in real time!`,
          notificationDetails: event.notificationDetails,
        });
      } else {
        await deleteUserNotificationDetails(fid);
      }

      break;
    case "miniapp_removed": {
      console.log("[webhook/farcaster] miniapp_removed", event);
      await deleteUserNotificationDetails(fid);

      break;
    }
    case "notifications_enabled": {
      console.log("[webhook/farcaster] notifications_enabled", event);
      await setUserNotificationDetails(fid, event.notificationDetails);

      await sendFarcasterNotification({
        fid,
        title: `Ding ding dong`,
        body: `Thank you for enabling notifications for Control the Stream!`,
        notificationDetails: event.notificationDetails,
      });
      break;
    }
    case "notifications_disabled": {
      console.log("[webhook/farcaster] notifications_disabled", event);
      await deleteUserNotificationDetails(fid);

      break;
    }
  }

  return Response.json({ success: true });
}
