import { createBaseAccountSDK } from "@base-org/account";
import { useCallback, useState } from "react";
import { decodeFunctionResult, encodeFunctionData, numberToHex, parseUnits } from "viem";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import { BULLMETER_ADDRESS } from "@/lib/constants";
import { CreateBullMeter } from "@/lib/database/db.schema";
import {
  GetAllPollsByCreatorResponse,
  ReadPollData,
} from "@/lib/types/bullmeter.type";

// Types for wallet_sendCalls
interface SendCallsCall {
  to: string;
  value: string;
  data?: string;
}

interface SendCallsParams {
  version: string;
  from: string;
  chainId: string;
  atomicRequired: boolean;
  calls: SendCallsCall[];
  capabilities: {
    paymasterService: {
      url: string;
    }
  }
}

// Helper function to create wallet_sendCalls parameters
const createSendCallsParams = (
  fromAddress: string,
  chainId: string,
  calls: SendCallsCall[],
  atomicRequired: boolean = true,
): SendCallsParams => {
  return {
    version: "2.0.0",
    from: fromAddress,
    chainId,
    atomicRequired,
    calls,
    capabilities: {
      paymasterService: {
        url: process.env.NEXT_PUBLIC_PAYMASTER_URL || ""
      }
    }
  };
};

// Helper function to execute batch transactions
const executeBatchTransactionHelper = async (
  provider: any,
  address: string,
  chainId: string,
  calls: SendCallsCall[],
  atomicRequired: boolean = true,
) => {
  const sendCallsParams = createSendCallsParams(
    address,
    chainId,
    calls,
    atomicRequired,
  );

  try {
    const result = await provider.request({
      method: "wallet_sendCalls",
      params: [sendCallsParams],
    });

    console.log("Batch transaction successful:", result);
    return { success: true, result };
  } catch (error: any) {
    console.error("Batch transaction failed:", error);

    // Handle specific error types
    let errorMessage = "Unknown error occurred";

    if (error.code === 4001) {
      errorMessage = "User rejected the batch transaction";
    } else if (error.code === -32602) {
      errorMessage = "Invalid parameters for wallet_sendCalls";
    } else if (error.code === -32601) {
      errorMessage = "wallet_sendCalls method not supported by this wallet";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage, originalError: error };
  }
};

export const useBullmeterPlugin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get wallet connection and switch to Base
  const getWalletConnection = useCallback(async () => {
    const provider = createBaseAccountSDK({}).getProvider();

    // Request account access
    const addresses = await provider.request({
      method: "eth_requestAccounts",
    });
    console.log("addresses:", addresses);

    if (!addresses) {
      throw new Error("No accounts available");
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
      throw new Error("No accounts available");
    }

    const address: string = addresses[0];

    // Switch to Base chain
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    });

    return { provider, address };
  }, []);

  // Helper function to execute batch transactions
  const executeBatch = useCallback(
    async (calls: SendCallsCall[], operation: string) => {
      const { provider, address } = await getWalletConnection();

      const batchResult = await executeBatchTransactionHelper(
        provider,
        address,
        "0x2105", // Base chain ID (8453 in hex)
        calls,
        true, // atomicRequired - all transactions must succeed or all fail
      );

      if (batchResult.success) {
        console.log(
          `${operation} transaction completed successfully:`,
          batchResult.result,
        );
        return { success: true, result: batchResult.result };
      } else {
        console.error(`${operation} transaction failed:`, batchResult.error);
        throw new Error(`${operation} failed: ${batchResult.error}`);
      }
    },
    [getWalletConnection],
  );

  // Bullmeter create function calls
  const createBullmeter = useCallback(
    async (
      question: string,
      votePrice: string,
      startTime: number,
      duration: number,
      maxVotePerUser: number,
      guest: string,
      guestSplitPercent: number,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const { provider, address } = await getWalletConnection();

        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "createPoll",
          args: [
            question, // string calldata _question
            BigInt(votePrice), // uint256 _votePrice (assuming 18 decimals)
            BigInt(startTime), // uint256 _startTime
            BigInt(duration), // uint256 _duration
            BigInt(maxVotePerUser), // uint256 _maxVotePerUser
            guest as `0x${string}`, // address _guest
            BigInt(guestSplitPercent), // uint256 _guestSplitPercent
          ],
        });

        const calls: SendCallsCall[] = [
          {
            to: BULLMETER_ADDRESS,
            value: "0x0",
            data: encodedFunctionCall,
          },
        ];

        const createResult = await executeBatch(calls, "Bullmeter create");

        if (createResult.success) {
          console.log(
            "✅ Poll creation transaction confirmed, reading updated last active poll...",
          );

          // Wait a moment for the transaction to be fully processed
          await new Promise((resolve) => setTimeout(resolve, 4000));

          const lastPollEncodedCall = encodeFunctionData({
            abi: bullMeterAbi,
            functionName: "getLastActivePollForCreator",
            args: [address as `0x${string}`],
          });

          // Read the last active poll again to verify the change
          const updatedLastPollResult = await provider.request({
            method: "eth_call",
            params: [
              {
                to: BULLMETER_ADDRESS,
                data: lastPollEncodedCall,
              },
              "latest",
            ],
          });

          const updatedDecodedLastPoll = decodeFunctionResult({
            abi: bullMeterAbi,
            functionName: "getLastActivePollForCreator",
            data: updatedLastPollResult as `0x${string}`,
          });

          const updatedLastPollId = updatedDecodedLastPoll[0];
          const updatedLastPollVotePrice = updatedDecodedLastPoll[4];
          const updatedLastPollDeadline = updatedDecodedLastPoll[6];

          // Store the poll data in the database
          try {
            const pollData: CreateBullMeter = {
              brandId: "417440a1a8ab42d0370a2e62817586db", //todo
              prompt: question + " " + "$$$" + updatedLastPollId,
              votePrice: updatedLastPollVotePrice.toString(),
              duration: duration,
              payoutAddresses: [guest as `0x${string}`],
              totalYesVotes: 0,
              totalNoVotes: 0,
              deadline: Number(updatedLastPollDeadline),
            };

            const response = await fetch("/api/bullmeters", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(pollData),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("✅ Poll data stored in database:", result);
            } else {
              const errorData = await response.json();
              console.error(
                "❌ Failed to store poll data in database:",
                errorData,
              );
            }
          } catch (dbError) {
            console.error("Database storage error:", dbError);
          }
        }

        return createResult;
      } catch (err: any) {
        console.error("Bullmeter create error:", err);
        setError(err.message || "Bullmeter create failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeBatch],
  );

  // Bullmeter extend function calls
  const extendBullmeter = useCallback(
    async (pollId: string, newDuration: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "extendDeadline",
          args: [
            pollId as `0x${string}`, // bytes32 _pollId
            BigInt(newDuration), // uint256 _newDuration
          ],
        });

        const calls: SendCallsCall[] = [
          {
            to: BULLMETER_ADDRESS,
            value: "0x0",
            data: encodedFunctionCall,
          },
        ];

        const extendResult = await executeBatch(calls, "Bullmeter extend");

        if (extendResult.success) {
          console.log(
            "✅ Poll extension transaction confirmed, updating database...",
          );

          // Update the database with new duration and deadline
          try {
            // Wait a moment for the transaction to be fully processed
            await new Promise((resolve) => setTimeout(resolve, 4000));

            const { provider, address } = await getWalletConnection();

            const lastPollEncodedCall = encodeFunctionData({
              abi: bullMeterAbi,
              functionName: "getLastActivePollForCreator",
              args: [address as `0x${string}`],
            });

            // Read the last active poll again to verify the change
            const updatedLastPollResult = await provider.request({
              method: "eth_call",
              params: [
                {
                  to: BULLMETER_ADDRESS,
                  data: lastPollEncodedCall,
                },
                "latest",
              ],
            });

            const updatedDecodedLastPoll = decodeFunctionResult({
              abi: bullMeterAbi,
              functionName: "getLastActivePollForCreator",
              data: updatedLastPollResult as `0x${string}`,
            });

            const updatedLastPollId = updatedDecodedLastPoll[0];
            const updatedLastPollDeadline = updatedDecodedLastPoll[6];

            const response = await fetch("/api/bullmeters/extend", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                pollId: updatedLastPollId,
                newDuration: newDuration,
                newDeadline: Number(updatedLastPollDeadline),
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("✅ Poll duration updated in database:", result);
            } else {
              const errorData = await response.json();
              console.error(
                "❌ Failed to update poll duration in database:",
                errorData,
              );
            }
          } catch (dbError) {
            console.error("Database update error:", dbError);
          }
        }

        return extendResult;
      } catch (err: any) {
        console.error("Bullmeter extend error:", err);
        setError(err.message || "Bullmeter extend failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeBatch],
  );

  // Bullmeter terminate function calls
  const terminateAndClaimBullmeter = useCallback(
    async (pollId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "claimFundAndTerminate",
          args: [pollId as `0x${string}`], // bytes32 _pollId
        });

        const calls: SendCallsCall[] = [
          {
            to: BULLMETER_ADDRESS,
            value: "0x0",
            data: encodedFunctionCall,
          },
        ];

        const terminateResult = await executeBatch(
          calls,
          "Bullmeter terminate",
        );

        if (terminateResult.success) {
          console.log(
            "✅ Poll termination transaction confirmed, updating database...",
          );

          // Update the database to mark poll as terminated
          try {
            const response = await fetch("/api/bullmeters/terminate", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                pollId: pollId,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("✅ Poll marked as terminated in database:", result);
            } else {
              const errorData = await response.json();
              console.error(
                "❌ Failed to update poll status in database:",
                errorData,
              );
            }
          } catch (dbError) {
            console.error("Database update error:", dbError);
          }
        }

        return terminateResult;
      } catch (err: any) {
        console.error("Bullmeter terminate error:", err);
        setError(err.message || "Bullmeter terminate failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeBatch],
  );

  // Bullmeter read history from an address function calls
  const getAllPollsByCreator =
    useCallback(async (): Promise<GetAllPollsByCreatorResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const { provider, address } = await getWalletConnection();

        // Encode the function call
        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "getAllPollsByCreator",
          args: [address as `0x${string}`],
        });

        // Call the contract function
        const result = await provider.request({
          method: "eth_call",
          params: [
            {
              to: BULLMETER_ADDRESS,
              data: encodedFunctionCall,
            },
            "latest",
          ],
        });

        // Decode the result using the contract ABI
        const decodedResult = decodeFunctionResult({
          abi: bullMeterAbi,
          functionName: "getAllPollsByCreator",
          data: result as `0x${string}`,
        });

        return { success: true, result: decodedResult as ReadPollData[] };
      } catch (err: any) {
        console.error("getAllPollsByCreator error:", err);
        const errorMessage = err.message || "Failed to get polls by creator";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, [getWalletConnection]);

  return {
    createBullmeter,
    extendBullmeter,
    terminateAndClaimBullmeter,
    getAllPollsByCreator,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
