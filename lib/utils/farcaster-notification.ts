import {
  MiniAppNotificationDetails,
  sendNotificationResponseSchema,
  type SendNotificationRequest,
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
    fid: number;
    farcasterNotificationDetails: MiniAppNotificationDetails;
    baseNotificationDetails: MiniAppNotificationDetails;
  }[];
}) {
  if (!users)
    return {
      message: "No users found",
      successfulTokens: {
        farcaster: [],
        base: [],
      },
      invalidTokens: {
        farcaster: [],
        base: [],
      },
      rateLimitedTokens: {
        farcaster: [],
        base: [],
      },
      errorFids: {
        farcaster: [],
        base: [],
      },
    };

  // Prepare the arrays to store the results
  const successfulTokens: Record<"farcaster" | "base", string[]> = {
    farcaster: [],
    base: [],
  };
  const invalidTokens: Record<"farcaster" | "base", string[]> = {
    farcaster: [],
    base: [],
  };
  const rateLimitedTokens: Record<"farcaster" | "base", string[]> = {
    farcaster: [],
    base: [],
  };
  const errorFids: Record<"farcaster" | "base", number[]> = {
    farcaster: [],
    base: [],
  };

  // Creates chunks of 100 users
  const chunkedUsers = [];
  for (let i = 0; i < users.length; i += 100) {
    chunkedUsers.push(users.slice(i, i + 100));
  }

  // For each chunk, send the notification to both farcaster and base
  for (const chunk of chunkedUsers) {
    // 1. First flow will send farcaster notifications
    const farcasterRequestBody = {
      notificationId: uuidv4(),
      title,
      body,
      targetUrl: targetUrl ?? env.NEXT_PUBLIC_URL,
      tokens: chunk.map((user) => user.farcasterNotificationDetails.token),
    } satisfies SendNotificationRequest;

    // Get the first user's farcaster notification details url because it's the same for all users in the chunk
    const farcasterFetchUrl = chunk[0].farcasterNotificationDetails.url;

    const farcasterResponse = await fetch(farcasterFetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(farcasterRequestBody),
    });

    if (farcasterResponse.status === 200) {
      const farcasterResponseJson = await farcasterResponse.json();
      console.log(
        "[sendNotificationToUsers/farcaster] responseJson",
        farcasterResponseJson,
      );
      const farcasterResponseBody = sendNotificationResponseSchema.safeParse(
        farcasterResponseJson,
      );
      if (!farcasterResponseBody.success) {
        console.error(
          `Error sending farcaster notification to chunk: malformed response`,
          farcasterResponseBody.error.errors,
        );
        errorFids.farcaster.push(...chunk.map((user) => user.fid));
        continue;
      }

      if (farcasterResponseBody.data.result.invalidTokens.length > 0) {
        console.error(
          `Error sending farcaster notification to chunk: invalid tokens`,
          farcasterResponseBody.data.result.invalidTokens,
        );
        invalidTokens.farcaster.push(
          ...farcasterResponseBody.data.result.invalidTokens,
        );
      }

      if (farcasterResponseBody.data.result.rateLimitedTokens.length > 0) {
        console.warn(
          `Error sending farcaster notification to chunk: rate limited`,
          farcasterResponseBody.data.result.rateLimitedTokens,
        );
        rateLimitedTokens.farcaster.push(
          ...farcasterResponseBody.data.result.rateLimitedTokens,
        );
      }

      successfulTokens.farcaster.push(
        ...farcasterResponseBody.data.result.successfulTokens,
      );
    } else {
      console.log(
        "[sendNotificationToUsers/farcaster] error",
        await farcasterResponse.json(),
      );
      errorFids.farcaster.push(...chunk.map((user) => user.fid));
    }

    // 2. Second flow will send base notifications
    const baseRequestBody = {
      notificationId: uuidv4(),
      title,
      body,
      targetUrl: targetUrl ?? env.NEXT_PUBLIC_URL,
      tokens: chunk.map((user) => user.baseNotificationDetails.token),
    } satisfies SendNotificationRequest;

    // Get the first user's base notification details url because it's the same for all users in the chunk
    const baseFetchUrl = chunk[0].baseNotificationDetails.url;

    const baseResponse = await fetch(baseFetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(baseRequestBody),
    });

    if (baseResponse.status === 200) {
      const baseResponseJson = await baseResponse.json();
      console.log(
        "[sendNotificationToUsers/base] responseJson",
        baseResponseJson,
      );
      const baseResponseBody =
        sendNotificationResponseSchema.safeParse(baseResponseJson);
      if (!baseResponseBody.success) {
        console.error(
          `Error sending base notification to chunk: malformed response`,
          baseResponseBody.error.errors,
        );
        errorFids.base.push(...chunk.map((user) => user.fid));
        continue;
      }

      if (baseResponseBody.data.result.invalidTokens.length > 0) {
        console.error(
          `Error sending base notification to chunk: invalid tokens`,
          baseResponseBody.data.result.invalidTokens,
        );
        invalidTokens.base.push(...baseResponseBody.data.result.invalidTokens);
      }

      if (baseResponseBody.data.result.rateLimitedTokens.length > 0) {
        console.warn(
          `Error sending base notification to chunk: rate limited`,
          baseResponseBody.data.result.rateLimitedTokens,
        );
        rateLimitedTokens.base.push(
          ...baseResponseBody.data.result.rateLimitedTokens,
        );
      }

      successfulTokens.base.push(
        ...baseResponseBody.data.result.successfulTokens,
      );
    } else {
      console.log(
        "[sendNotificationToUsers/base] error",
        await baseResponse.json(),
      );
      errorFids.base.push(...chunk.map((user) => user.fid));
    }
  }

  // Return the results
  return {
    message: "Sent notifications to all users",
    successfulTokens,
    invalidTokens,
    rateLimitedTokens,
    errorFids,
  };
}
