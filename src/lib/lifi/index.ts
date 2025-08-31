"use client";

import {
  ChainType,
  createConfig,
  EVM,
  getTokenBalancesByChain,
  getTokens,
  TokenAmount,
} from "@lifi/sdk";
import { getWalletClient, switchChain } from "@wagmi/core";
import { Address } from "viem";
import {
  getTokenBalanceUSDValue,
  type WalletBalanceData,
} from "@/lib/lifi/utils";
import { wagmiConfigMiniApp as wagmiConfig } from "@/lib/reown";

createConfig({
  integrator: "Starter",
  // apiKey: env.LIFI_API_KEY,
  providers: [
    EVM({
      getWalletClient: async () => await getWalletClient(wagmiConfig),
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId });
        return getWalletClient(wagmiConfig, { chainId: chain.id });
      },
    }),
  ],
});

export const getWalletBalance = async (
  walletAddress: Address,
): Promise<WalletBalanceData> => {
  try {
    const tokensResponse = await getTokens({
      chainTypes: [ChainType.EVM],
      minPriceUSD: 0.1,
    });

    const tokenBalances = await getTokenBalancesByChain(
      walletAddress,
      tokensResponse.tokens,
    );

    // Filter tokens with positive balances while maintaining the original structure
    const filteredTokenBalances: { [chainId: number]: TokenAmount[] } = {};

    for (const [chainId, balances] of Object.entries(tokenBalances)) {
      filteredTokenBalances[Number(chainId)] = balances.filter(
        (balance) => balance.amount && Number(balance.amount) > 0,
      );
    }

    // get wallet total balance in USD
    const walletTotalBalanceUSD = Object.values(filteredTokenBalances).reduce(
      (total, balances) =>
        total +
        balances.reduce(
          (sum, balance) => sum + getTokenBalanceUSDValue(balance),
          0,
        ),
      0,
    );
    return {
      totalBalanceUSD: walletTotalBalanceUSD,
      tokenBalances: filteredTokenBalances,
    };
  } catch (error) {
    console.error(error);
  }
  return {
    totalBalanceUSD: 0,
    tokenBalances: {},
  };
};
