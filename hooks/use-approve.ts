import { getCapabilities, sendCalls } from "@wagmi/core";
import { useState } from "react";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { BASE_USDC_ADDRESS, BULLMETER_ADDRESS } from "@/lib/constants";
import { wagmiConfigMiniApp } from "@/lib/reown";

interface UseApproveProps {
  amount?: string; // Amount in USDC (e.g., "1" for 1 USDC)
  spender?: string; // Address to approve (defaults to BullMeter contract)
}

export const useApprove = ({
  amount = "1",
  spender = BULLMETER_ADDRESS,
}: UseApproveProps = {}) => {
  // Parse the amount to USDC decimals (6 decimals for USDC)
  const parsedAmount = parseUnits(amount, 6);

  // State for tracking the call
  const [callId, setCallId] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Execute the approval using sendCalls
  const approve = async () => {
    try {
      setIsPending(true);
      setIsError(false);
      setError(null);
      setIsSuccess(false);

      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spender as `0x${string}`, parsedAmount],
      });

      // Send the call
      const result = await sendCalls(wagmiConfigMiniApp, {
        calls: [
          {
            to: BASE_USDC_ADDRESS as `0x${string}`,
            data: approveData,
          },
        ],
        capabilities: {
          paymasterService: {
            url:
              process.env.NEXT_PUBLIC_PAYMASTER_URL || "",
          },
        },
      });

      setCallId(result.id);
      setIsSuccess(true);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsPending(false);
    }
  };

  return {
    approve,
    callId,
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
