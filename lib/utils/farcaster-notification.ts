import {
  MiniAppNotificationDetails,
  sendNotificationResponseSchema,
  type SendNotificationRequest,
  type SendNotificationResponse,
} from "@farcaster/miniapp-sdk";
import ky from "ky";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/zod";
import { SendFarcasterNotificationResult } from "../types/farcaster.type";

/**
 * Send a notification to a Farcaster user.
 *
 * @param fid - The Farcaster user ID
 * @param title - The title of the notification
 * @param body - The body of the notification
 * @param targetUrl - The URL to redirect to when the notification is clicked (optional)
 * @param notificationDetails - The notification details of the user (required)
 * @returns The result of the notification
 */
export async function sendFarcasterNotification({
  fid,
  title,
  body,
  targetUrl,
  notificationDetails,
}: {
  fid: number;
  title: string;
  body: string;
  targetUrl?: string;
  notificationDetails?: MiniAppNotificationDetails | null;
}): Promise<SendFarcasterNotificationResult> {
  if (!notificationDetails) return { state: "no_token" };

  const url = notificationDetails.url;
  const tokens = [notificationDetails.token];

  const requestBody = {
    notificationId: uuidv4(),
    title,
    body,
    targetUrl: targetUrl ?? env.NEXT_PUBLIC_URL,
    tokens,
  } satisfies SendNotificationRequest;

  const response = await ky.post(url, {
    json: requestBody,
    timeout: false,
  });

  const responseJson = await response.json();

  if (response.status === 200) {
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (!responseBody.success) {
      console.error(
        `Error sending notification to ${fid}: malformed response`,
        responseBody.error.errors,
      );
      return { state: "error", error: responseBody.error.errors };
    }

    if (responseBody.data.result.invalidTokens.length > 0) {
      console.error(
        `Error sending notification to ${fid}: invalid tokens`,
        responseBody.data.result.invalidTokens,
      );
      return {
        state: "invalid_token",
        invalidTokens: responseBody.data.result.invalidTokens,
      };
    }

    if (responseBody.data.result.rateLimitedTokens.length > 0) {
      console.error(
        `Error sending notification to ${fid}: rate limited`,
        responseBody.data.result.rateLimitedTokens,
      );
      return {
        state: "rate_limit",
        rateLimitedTokens: responseBody.data.result.rateLimitedTokens,
      };
    }

    return { state: "success" };
  }

  console.error(`Error sending notification to ${fid}: ${response.status}`);
  return { state: "error", error: responseJson };
}

/**
 * Send a notification to a list of Farcaster users.
 *
 * @param title - The title of the notification
 * @param body - The body of the notification
 * @param targetUrl - The URL to redirect to when the notification is clicked (optional)
 * @param users - The users to send the notification to
 * @returns The result of the notification sent to the users
 */
export async function sendNotificationToUsers({
  title,
  body,
  targetUrl,
  users,
}: {
  title: string;
  body: string;
  targetUrl?: string;
  users?: {
    farcasterFid: number;
    farcasterNotificationDetails: MiniAppNotificationDetails;
  }[];
}) {
  if (!users)
    return {
      message: "No users found",
      successfulTokens: [],
      invalidTokens: [],
      rateLimitedTokens: [],
      errorFids: [],
    };

  // Creates chunks of 100 users
  const chunkedUsers = [];
  for (let i = 0; i < users.length; i += 100) {
    chunkedUsers.push(users.slice(i, i + 100));
  }

  const successfulTokens = [];
  const invalidTokens = [];
  const rateLimitedTokens = [];
  const errorFids = [];

  for (const chunk of chunkedUsers) {
    const requestBody = {
      notificationId: uuidv4(),
      title,
      body,
      targetUrl: targetUrl ?? env.NEXT_PUBLIC_URL,
      tokens: chunk.map((user) => user.farcasterNotificationDetails.token),
    } satisfies SendNotificationRequest;

    console.log("[sendNotificationToUsers] requestBody", requestBody);

    const response = await fetch(chunk[0].farcasterNotificationDetails.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      const responseJson = await response.json();
      console.log("[sendNotificationToUsers] responseJson", responseJson);
      const responseBody =
        sendNotificationResponseSchema.safeParse(responseJson);
      if (!responseBody.success) {
        console.error(
          `Error sending notification to chunk: malformed response`,
          responseBody.error.errors,
        );
        errorFids.push(...chunk.map((user) => user.farcasterFid));
        continue;
      }

      if (responseBody.data.result.invalidTokens.length > 0) {
        console.error(
          `Error sending notification to chunk: invalid tokens`,
          responseBody.data.result.invalidTokens,
        );
        invalidTokens.push(...responseBody.data.result.invalidTokens);
      }

      if (responseBody.data.result.rateLimitedTokens.length > 0) {
        console.warn(
          `Error sending notification to chunk: rate limited`,
          responseBody.data.result.rateLimitedTokens,
        );
        rateLimitedTokens.push(...responseBody.data.result.rateLimitedTokens);
      }

      successfulTokens.push(...responseBody.data.result.successfulTokens);
    } else {
      console.log("[sendNotificationToUsers] error", await response.json());
      errorFids.push(...chunk.map((user) => user.farcasterFid));
    }
  }

  return {
    message: "Sent notifications to all users",
    successfulTokens,
    invalidTokens,
    rateLimitedTokens,
    errorFids,
  };
}
