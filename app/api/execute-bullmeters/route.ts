import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, encodeFunctionData, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import { BULLMETER_ADDRESS } from "@/lib/constants";
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

    // Send the transaction
    const hash = await walletClient.sendTransaction({
      to: BULLMETER_ADDRESS as `0x${string}`,
      data,
      value: BigInt(0), // No ETH value needed for this function
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionHash: hash,
        pollId,
        isYes,
        voteCount: voteCount,
        message: "Vote transaction submitted successfully",
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
