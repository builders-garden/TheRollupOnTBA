import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, encodeFunctionData, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import { BULLMETER_ADDRESS } from "@/lib/constants";
import { BullMeter } from "@/lib/database/db.schema";
import { updateVoteCounts } from "@/lib/database/queries/bull-meter.query";
import { authenticateApi } from "@/lib/utils/authenticate-api";
import { env } from "@/lib/zod";

interface VoteRequest {
  voter: string;
  pollId: string;
  isYes: boolean;
  voteCount: string;
}

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  const walletAddress = req.headers.get("x-user-wallet-address");

  try {
    const { voter, pollId, isYes, voteCount }: VoteRequest = await req.json();

    // 0. Body validation
    if (!voter || !pollId || typeof isYes !== "boolean" || !voteCount) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: voter, pollId, isYes, voteCount",
        },
        { status: 400 },
      );
    }

    // Validate voteCount is a positive number
    let voteCountBigInt = BigInt(voteCount);
    if (voteCountBigInt <= 0) {
      voteCountBigInt = BigInt(1);
    }

    // 1. check if the user is authenticated
    const {
      status,
      user: authUser,
      statusCode,
      error,
    } = await authenticateApi(fid, walletAddress);

    if (status === "nok" || error || !authUser) {
      console.error(`[api/lyrics] Authentication failed`, {
        status,
        error,
        authUser,
      });
      return NextResponse.json(
        { success: false, error: error || "Authentication failed" },
        { status: statusCode },
      );
    }

    // Create account from private key
    const account = privateKeyToAccount(
      env.BACKEND_PRIVATE_KEY as `0x${string}`,
    );

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http("https://mainnet-preconf.base.org"), //flashbot rpc
    });

    const publicClient = createPublicClient({
      chain: base,
      transport: http(""), 
    });

    // Encode the vote function call
    const data = encodeFunctionData({
      abi: bullMeterAbi,
      functionName: "voteFor",
      args: [
        voter as `0x${string}`,
        pollId as `0x${string}`,
        isYes,
        voteCountBigInt,
      ],
    });

    let hash: `0x${string}` | undefined;
    let retryCount = 0;
    let nonce: number;
    const maxRetries = 3; // Try once more with different nonce

    while (retryCount <= maxRetries) {
      try {
        // Get current nonce
        nonce = await publicClient.getTransactionCount({
          address: account.address,
          blockTag: "pending",
        });

        if (!nonce) {
          nonce = Math.floor(Math.random() * 100);
        }

        // Send the transaction with explicit nonce
        hash = await walletClient.sendTransaction({
          to: BULLMETER_ADDRESS as `0x${string}`,
          data,
          value: BigInt(0), // No ETH value needed for this function
          nonce: nonce + retryCount, // Increment nonce on retry
        });

        // If successful, break out of the loop
        break;
      } catch (error) {
        console.error(
          `Vote execution error (attempt ${retryCount + 1}):`,
          error,
        );

        retryCount++;

        // If we've exhausted all retries, return error
        if (retryCount > maxRetries) {
          return NextResponse.json(
            {
              success: false,
              error: "Failed to execute vote after retries",
              details: error instanceof Error ? error.message : "Unknown error",
              attempts: retryCount,
            },
            { status: 500 },
          );
        }

        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update database with vote counts
    let updatedBullMeter: BullMeter | null = null;
    try {
      updatedBullMeter = await updateVoteCounts(
        pollId,
        isYes,
        Number(voteCountBigInt),
      );
    } catch (dbError) {
      console.error("❌ Database update failed:", dbError);
      // Don't fail the entire request if database update fails
      // The blockchain transaction was successful
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionHash: hash,
        pollId,
        isYes,
        voteCount: voteCount,
        message: "Vote transaction submitted successfully",
        endTime: updatedBullMeter?.deadline,
      },
    });
  } catch (error) {
    console.error("Vote execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute vote",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
