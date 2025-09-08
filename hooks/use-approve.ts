import { erc20Abi, parseUnits } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BASE_USDC_ADDRESS, BULLMETER_ADDRESS } from "@/lib/constants";

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

  // Write contract for approval
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Execute the approval
  const approve = () => {
    writeContract({
      address: BASE_USDC_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender as `0x${string}`, parsedAmount],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isError,
    error,
    isConfirming,
    isConfirmed,
    receiptError,
    // Combined loading state
    isLoading: isPending || isConfirming,
    // Combined success state
    isSuccess: isConfirmed,
    // Combined error state
    hasError: isError || !!receiptError,
  };
};
