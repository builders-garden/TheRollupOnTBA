import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/zod";

export const dynamic = "force-dynamic";

// Interface matching your VoteRequest
interface VoteRequest {
  pollId: string;
  isBull: boolean;
  votes: string;
  votePrice: string;
  platform: string;
  senderId: string;
  voterAddress: string;
  receiverBrandId: string;
  // Optional fields
  username?: string;
  position?: string;
  profilePicture?: string;
  endTimeMs?: number;
}

// Interface matching your VoteResponse
interface VoteResponse {
  jobId: string;
  status: "queued";
  message: string;
  pollId: string;
}

/**
 * Proxy endpoint to submit votes to the socket server
 * This keeps the backend secret secure on the server side
 */
export const POST = async (req: NextRequest) => {
  try {
    console.log("📥 Vote API endpoint called");

    // Parse the request body
    const voteData: VoteRequest = await req.json();

    // Validate required fields
    if (
      !voteData.pollId ||
      !voteData.voterAddress ||
      !voteData.senderId ||
      !voteData.receiverBrandId
    ) {
      console.error("❌ Missing required fields:", {
        hasPollId: !!voteData.pollId,
        hasVoterAddress: !!voteData.voterAddress,
        hasSenderId: !!voteData.senderId,
        hasReceiverBrandId: !!voteData.receiverBrandId,
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: pollId, voterAddress, senderId, receiverBrandId",
        },
        { status: 400 },
      );
    }

    // Make the request to your socket server
    const socketServerUrl = `${env.NEXT_PUBLIC_SOCKET_URL}/api/bullmeter/vote`;

    const response = await ky.post<VoteResponse>(socketServerUrl, {
      json: voteData,
      headers: {
        "x-api-secret": env.BACKEND_SECRET,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("✅ Socket server response status:", response.status);

    if (!response.ok) {
      console.error(
        "❌ Socket server error:",
        response.status,
        response.statusText,
      );
      throw new Error(
        `Socket server error: ${response.status} ${response.statusText}`,
      );
    }

    const responseData = await response.json();
    console.log("🎉 Vote successfully proxied:");

    // Return the response from the socket server
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("💥 Vote proxy error:", error);

    let errorMessage = "Failed to submit vote";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("💥 Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }

    // Check if it's a network/timeout error
    if (error && typeof error === "object" && "name" in error) {
      if (error.name === "TimeoutError") {
        errorMessage =
          "Request timeout - socket server took too long to respond";
        statusCode = 504;
      } else if (error.name === "HTTPError") {
        statusCode = 502;
        errorMessage = "Socket server returned an error";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode },
    );
  }
};
