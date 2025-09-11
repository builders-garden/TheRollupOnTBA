import { useQuery } from "@tanstack/react-query";
import { Address, createPublicClient, erc20Abi, formatUnits, http } from "viem";
import { base } from "viem/chains";
import { BASE_USDC_ADDRESS } from "@/lib/constants";

// Create a public client for Base chain
const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

interface UseUsdcBalanceProps {
  address?: Address;
  enabled?: boolean;
}

export const useUsdcBalance = ({
  address,
  enabled = true,
}: UseUsdcBalanceProps) => {
  const {
    data: balance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usdcBalance", address],
    queryFn: async (): Promise<{
      raw: bigint;
      formatted: string;
      decimals: number;
    }> => {
      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const rawBalance = await baseClient.readContract({
          address: BASE_USDC_ADDRESS as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        });

        const decimals = 6; // USDC has 6 decimals
        const formatted = formatUnits(rawBalance, decimals);

        return {
          raw: rawBalance,
          formatted,
          decimals,
        };
      } catch (error) {
        console.error("Error fetching USDC balance:", error);
        throw error;
      }
    },
    enabled: enabled && !!address,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    balance,
    isLoading,
    error,
  };
};
