import { FeaturedToken } from "@/lib/database/db.schema";
import { ZERO_ADDRESS } from "../constants";

/**
 * Extended token type with CAIP-19 formatted token ID
 */
export interface FarcasterToken extends FeaturedToken {
  formattedToken: string;
}

/**
 * Format token address for CAIP-19 asset ID
 * @param address - Token contract address
 * @param chainId - Chain ID
 * @returns Formatted CAIP-19 asset ID
 */
const formatTokenAddress = (address: string, chainId: number): string => {
  // Check if it's a native token
  if (address === ZERO_ADDRESS) {
    return `eip155:${chainId}/native`;
  }

  // ERC20 token
  return `eip155:${chainId}/erc20:${address}`;
};

/**
 * Convert a single token address and chain ID to CAIP-19 format
 * @param address - Token contract address
 * @param chainId - Chain ID
 * @returns CAIP-19 formatted token ID
 */
export const formatSingleToken = (
  address: string,
  chainId?: number,
): string => {
  if (!chainId) {
    chainId = 8453;
  }
  return formatTokenAddress(address, chainId);
};

/**
 * Transform featured tokens to include CAIP-19 formatted token ID
 * @param tokens - Array of featured tokens from getActiveFeaturedTokens
 * @returns Array of tokens with formattedToken parameter
 */
export const formatTokensForFarcaster = (
  tokens: FeaturedToken[],
): FarcasterToken[] => {
  return tokens.map((token) => ({
    ...token,
    formattedToken: formatTokenAddress(
      token.address || ZERO_ADDRESS,
      token.chainId || 1,
    ),
  }));
};
