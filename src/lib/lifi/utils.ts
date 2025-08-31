import { TokenAmount } from "@lifi/sdk";
import { formatUnits } from "viem";

// Define proper types for our wallet balance data
export interface WalletBalanceData {
  totalBalanceUSD: number;
  tokenBalances: { [chainId: number]: TokenAmount[] };
}

/**
 * Formats a token balance for display, taking into account the token's decimals
 * @param token The token amount object from LiFi SDK
 * @param displayDecimals Number of decimals to show in the formatted output (default: 4)
 * @returns Formatted balance as a string
 */
export function formatTokenBalance(
  token: TokenAmount,
  displayDecimals: number = 4,
): string {
  if (!token.amount || Number(token.amount) === 0) {
    return "0";
  }

  // Format the amount using the token's decimals
  const formattedAmount = formatUnits(
    BigInt(token.amount.toString()),
    token.decimals,
  );

  // Convert to number and fix to the desired display decimals
  return Number(formattedAmount).toFixed(displayDecimals);
}

/**
 * Gets the USD value of a token balance
 * @param token The token amount object from LiFi SDK
 * @returns USD value as a number
 */
export function getTokenBalanceUSDValue(token: TokenAmount): number {
  if (!token.amount || Number(token.amount) === 0 || !token.priceUSD) {
    return 0;
  }

  const formattedAmount = formatUnits(
    BigInt(token.amount.toString()),
    token.decimals,
  );
  return Number(formattedAmount) * Number(token.priceUSD);
}

/**
 * Gets the current ETH price in USD from token balance data
 * If ETH/WETH is not found in user's balance, it will fallback to null
 * @param tokenBalancesData The wallet balance data from LiFi
 * @returns ETH price in USD, or null if not found
 */
export function getETHPriceUSD(
  tokenBalancesData: WalletBalanceData | undefined,
): number | null {
  if (!tokenBalancesData?.tokenBalances) return null;

  // Flatten all tokens from all chains to find ETH/WETH
  const allTokens: TokenAmount[] = Object.values(
    tokenBalancesData.tokenBalances,
  ).flat();

  // Look for ETH or WETH token in the balance data
  const ethToken = allTokens.find(
    (token: TokenAmount) => token.symbol === "ETH" || token.symbol === "WETH",
  );

  return ethToken?.priceUSD ? Number(ethToken.priceUSD) : null;
}

/**
 * Alternative function to get ETH price from a separate API call
 * This can be used as a fallback when user doesn't have ETH in their wallet
 * @param allTokens All available tokens from LiFi
 * @returns ETH price in USD, or null if not found
 */
export function getETHPriceFromTokenList(
  allTokens: TokenAmount[],
): number | null {
  const ethToken = allTokens.find(
    (token: TokenAmount) => token.symbol === "ETH" || token.symbol === "WETH",
  );

  return ethToken?.priceUSD ? Number(ethToken.priceUSD) : null;
}

/**
 * Convert ETH amount to USD
 * @param ethAmount ETH amount as string
 * @param ethPriceUSD Current ETH price in USD
 * @returns USD amount as number
 */
export function convertETHToUSD(
  ethAmount: string,
  ethPriceUSD: number,
): number {
  return Number(ethAmount) * ethPriceUSD;
}

/**
 * Convert USD amount to ETH
 * @param usdAmount USD amount as number
 * @param ethPriceUSD Current ETH price in USD
 * @returns ETH amount as string
 */
export function convertUSDToETH(
  usdAmount: number,
  ethPriceUSD: number,
): string {
  return (usdAmount / ethPriceUSD).toString();
}

/**
 * Format USD amount for display
 * @param usdAmount USD amount as number
 * @param decimals Number of decimal places
 * @returns Formatted USD string
 */
export function formatUSDAmount(
  usdAmount: number,
  decimals: number = 2,
): string {
  return `$${usdAmount.toFixed(decimals)}`;
}
