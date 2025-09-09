import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, encodeFunctionData, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import { BULLMETER_ADDRESS } from "@/lib/constants";

interface VoteRequest {
  voter: string;
  pollId: string;
  isYes: boolean;
  voteCount: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const { voter, pollId, isYes, voteCount }: VoteRequest = await req.json();

    // Validation
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

    // Create account from private key
    const account = privateKeyToAccount(
      process.env.BACKEND_PRIVATE_KEY as `0x${string}`,
    );

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http("https://mainnet-preconf.base.org"), //flashbot rpc
    });

    console.log("pollId:", pollId);
    console.log("voter:", voter);
    console.log("isYes:", isYes);
    console.log("voteCount:", voteCount);
    console.log("voteCountBigInt:", voteCountBigInt);

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
