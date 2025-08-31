import { useQuery } from "@tanstack/react-query";
import { basePreconf } from "viem/chains";
import { useAccount, useBalance } from "wagmi";
import { getWalletBalance } from "@/lib/lifi";

export const useWalletBalance = () => {
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    chainId: basePreconf.id,
  });

  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useQuery({
    queryKey: ["tokenBalances", address],
    queryFn: async () => {
      if (address) {
        return await getWalletBalance(address);
      }
      return {
        totalBalanceUSD: 0,
        tokenBalances: {},
      };
    },
    enabled: !!address,
  });

  return {
    ethBalance,
    tokenBalances,
    isLoadingTokenBalances,
  };
};
