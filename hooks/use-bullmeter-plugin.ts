import { createBaseAccountSDK } from "@base-org/account";
import { useCallback, useState } from "react";
import { decodeFunctionResult, encodeFunctionData, parseUnits } from "viem";
import { bullMeterAbi } from "@/lib/abi/bull-meter-abi";
import { BULLMETER_ADDRESS } from "@/lib/constants";
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
    console.log("provider:", provider);

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

    console.log("Switched to Base chain");

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
        const encodedFunctionCall = encodeFunctionData({
          abi: bullMeterAbi,
          functionName: "createPoll",
          args: [
            question, // string calldata _question
            parseUnits(votePrice, 18), // uint256 _votePrice (assuming 18 decimals)
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

        return await executeBatch(calls, "Bullmeter create");
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

        return await executeBatch(calls, "Bullmeter extend");
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

        return await executeBatch(calls, "Bullmeter terminate");
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

        console.log("getAllPollsByCreator raw result:", result);

        // Decode the result using the contract ABI
        const decodedResult = decodeFunctionResult({
          abi: bullMeterAbi,
          functionName: "getAllPollsByCreator",
          data: result as `0x${string}`,
        });

        console.log("getAllPollsByCreator decoded result:", decodedResult);

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
