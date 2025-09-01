import { ChainType, getTokens, TokenAmount } from "@lifi/sdk";
import { useQuery } from "@tanstack/react-query";
import {
  getETHPriceFromTokenList,
  getETHPriceUSD,
  WalletBalanceData,
} from "@/lib/lifi/utils";

/**
 * Hook to fetch ETH price in USD
 * First tries to get it from user's wallet balance data, then falls back to fetching from token list
 * @param walletBalanceData Optional wallet balance data to extract ETH price from
 * @returns Query result with ETH price in USD
 */
export function useETHPrice(walletBalanceData?: WalletBalanceData) {
  return useQuery<number | null>({
    queryKey: ["ethPrice", walletBalanceData?.totalBalanceUSD],
    queryFn: async () => {
      // First try to get ETH price from user's wallet balance
      const priceFromWallet = getETHPriceUSD(walletBalanceData);
      if (priceFromWallet) {
        console.log("ETH price from wallet:", priceFromWallet);
        return priceFromWallet;
      }

      // Fallback: fetch ETH price from token list
      try {
        console.log("Fetching ETH price from token list...");
        const tokensResponse = await getTokens({
          chainTypes: [ChainType.EVM],
          minPriceUSD: 100,
        });

        // Flatten all tokens from all chains to find ETH/WETH
        const allTokens: TokenAmount[] = Object.values(
          tokensResponse.tokens,
        ).flat();

        // Look for ETH or WETH in the token list
        const ethPrice = getETHPriceFromTokenList(allTokens);
        console.log("ETH price from token list:", ethPrice);
        return ethPrice;
      } catch (error) {
        console.error("Error fetching ETH price from token list:", error);
        return null;
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
