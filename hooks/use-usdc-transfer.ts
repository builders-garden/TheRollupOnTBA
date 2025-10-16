import { Config, writeContract } from "@wagmi/core";
import { useState } from "react";
import { erc20Abi, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { BASE_USDC_ADDRESS } from "@/lib/constants";

interface UseUsdcTransferProps {
  amount: string; // Amount in USDC (e.g., "1" for 1 USDC) - required
  receiver: string; // Address to receive USDC - required
  wagmiConfig: Config;
}

export const useUsdcTransfer = ({
  amount,
  receiver,
  wagmiConfig,
}: UseUsdcTransferProps) => {
  const { address } = useAccount();

  // State for tracking the call
  const [txHash, setTxHash] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Execute the USDC transfer using sendCalls
  const transfer = async (
    customAmount?: string,
    customReceiver?: string,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    try {
      setIsPending(true);
      setIsError(false);
      setError(null);
      setIsSuccess(false);

      // Use custom parameters if provided, otherwise use hook parameters
      const finalAmount = customAmount || amount;
      const finalReceiver = customReceiver || receiver;

      // Parse the amount to USDC decimals (6 decimals for USDC)
      const parsedAmount = parseUnits(finalAmount, 6);

      console.log("address", address);
      console.log("finalReceiver", finalReceiver);
      console.log("parsedAmount", parsedAmount);
      console.log("BASE_USDC_ADDRESS", BASE_USDC_ADDRESS);

      // Send the call
      const result = await writeContract(wagmiConfig, {
        abi: erc20Abi,
        functionName: "transfer",
        args: [finalReceiver as `0x${string}`, parsedAmount],
        address: BASE_USDC_ADDRESS as `0x${string}`,
      });

      console.log("Transaction hash:", result);

      setTxHash(result);
      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      onError?.();
    } finally {
      setIsPending(false);
    }
  };

  return {
    transfer,
    txHash,
    isPending,
    isError,
    error,
    // Combined loading state
    isLoading: isPending,
    // Combined success state
    isSuccess,
    // Combined error state
    hasError: isError,
  };
};
