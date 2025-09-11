import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
} from "viem";
import { base } from "viem/chains";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import { BULLMETER_ADDRESS } from "@/lib/constants";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: address",
        },
        { status: 400 },
      );
    }

    // Create public client for contract calls
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Call lastNonce(address) function
    const lastNonceEncodedCall = encodeFunctionData({
      abi: bullMeterAbi,
      functionName: "lastNonce",
      args: [address as `0x${string}`],
    });

    const lastNonceResult = await publicClient.request({
      method: "eth_call",
      params: [
        {
          to: BULLMETER_ADDRESS,
          data: lastNonceEncodedCall,
        },
        "latest",
      ],
    });

    const decodedLastNonce = decodeFunctionResult({
      abi: bullMeterAbi,
      functionName: "lastNonce",
      data: lastNonceResult as `0x${string}`,
    });

    const lastNonce = Number(decodedLastNonce);

    console.log(`Last nonce for address ${address}: ${lastNonce}`);

    let polls: any[] = [];

    if (lastNonce < 50) {
      // Call getAllPollsByCreator
      const getAllPollsEncodedCall = encodeFunctionData({
        abi: bullMeterAbi,
        functionName: "getAllPollsByCreator",
        args: [address as `0x${string}`],
      });

      const getAllPollsResult = await publicClient.request({
        method: "eth_call",
        params: [
          {
            to: BULLMETER_ADDRESS,
            data: getAllPollsEncodedCall,
          },
          "latest",
        ],
      });

      const decodedAllPolls = decodeFunctionResult({
        abi: bullMeterAbi,
        functionName: "getAllPollsByCreator",
        data: getAllPollsResult as `0x${string}`,
      });

      // Filter polls with fundsClaimed = false and convert BigInt values to strings for JSON serialization
      polls = decodedAllPolls
        .filter((poll: any) => poll.fundsClaimed === false && poll.totalUsdcCollected > BigInt(0))
        .map((poll: any) => ({
          ...poll,
          votePrice: poll.votePrice.toString(),
          startTime: poll.startTime.toString(),
          deadline: poll.deadline.toString(),
          maxVotePerUser: poll.maxVotePerUser.toString(),
          guestSplitPercent: poll.guestSplitPercent.toString(),
          totalYesVotes: poll.totalYesVotes.toString(),
          totalNoVotes: poll.totalNoVotes.toString(),
          totalUsdcCollected: poll.totalUsdcCollected.toString(),
        }));
    } else {
      // Call getPollsByCreatorFromNonce for each 50 of the last nonce
      const batchSize = 50;
      const totalBatches = Math.ceil((lastNonce + 1) / batchSize);

      console.log(
        `Last nonce is ${lastNonce}, will fetch in ${totalBatches} batches of ${batchSize}`,
      );

      for (let i = 0; i < totalBatches; i++) {
        const startNonce = i * batchSize;
        const endNonce = Math.min(startNonce + batchSize - 1, lastNonce);

        console.log(
          `Fetching batch ${i + 1}/${totalBatches}: nonces ${startNonce} to ${endNonce}`,
        );

        const getPollsFromNonceEncodedCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "getPollsByCreatorFromNonce",
          args: [
            address as `0x${string}`,
            BigInt(startNonce),
            BigInt(endNonce),
          ],
        });

        const getPollsFromNonceResult = await publicClient.request({
          method: "eth_call",
          params: [
            {
              to: BULLMETER_ADDRESS,
              data: getPollsFromNonceEncodedCall,
            },
            "latest",
          ],
        });

        const decodedPollsFromNonce = decodeFunctionResult({
          abi: bullMeterAbi,
          functionName: "getPollsByCreatorFromNonce",
          data: getPollsFromNonceResult as `0x${string}`,
        });

        // Filter polls with fundsClaimed = false and convert BigInt values to strings for JSON serialization
        const serializedPolls = decodedPollsFromNonce
          .filter((poll: any) => poll.fundsClaimed === false && poll.totalUsdcCollected > BigInt(0))
          .map((poll: any) => ({
            ...poll,
            votePrice: poll.votePrice.toString(),
            startTime: poll.startTime.toString(),
            deadline: poll.deadline.toString(),
            maxVotePerUser: poll.maxVotePerUser.toString(),
            guestSplitPercent: poll.guestSplitPercent.toString(),
            totalYesVotes: poll.totalYesVotes.toString(),
            totalNoVotes: poll.totalNoVotes.toString(),
            totalUsdcCollected: poll.totalUsdcCollected.toString(),
          }));

        // Add batch data
        polls.push({
          batch: i + 1,
          startNonce,
          endNonce,
          polls: serializedPolls,
        });

        console.log(
          `Batch ${i + 1} completed: ${decodedPollsFromNonce.length} polls`,
        );
      }
    }

    // Extract all poll IDs from the filtered polls
    const pollIds: string[] = [];
    if (lastNonce < 50) {
      // For getAllPollsByCreator, polls is a direct array
      pollIds.push(...polls.map((poll: any) => poll.pollId));
    } else {
      // For batched approach, extract from each batch
      polls.forEach((batch: any) => {
        pollIds.push(...batch.polls.map((poll: any) => poll.pollId));
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        address,
        lastNonce,
        totalPolls:
          lastNonce < 50
            ? polls.length
            : polls.reduce((acc, batch) => acc + batch.polls.length, 0),
        pollIds,
        polls,
      },
    });
  } catch (error) {
    console.error("Claim bullmeters error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch polls",
      },
      { status: 500 },
    );
  }
};
