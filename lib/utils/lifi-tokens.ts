import { ChainId, ChainType, GetTokenRequest, getTokens } from "@lifi/sdk";
import { BASE_APP_SUPPORTED_CHAINS } from "../constants";

interface GetLifiTokensParams {
  chains?: ChainId[];
  chainTypes?: ChainType[];
  tokenName?: string;
  tokenAddress?: string;
}

export const getLifiTokens = async (params?: GetLifiTokensParams) => {
  const tokens = await getTokens({
    chains: params?.chains,
    chainTypes: params?.chainTypes || [ChainType.EVM],
  });
  // filter tokens by chainId, get only the tokens that are currently supported by the Base App trade feature
  const supportedChains = BASE_APP_SUPPORTED_CHAINS.map(
    (chain) => chain.chainId,
  );
  const filteredTokens: { [chainId: number]: any[] } = {};

  Object.entries(tokens.tokens).forEach(([chainId, tokenList]) => {
    if (supportedChains.includes(chainId)) {
      let filteredList = tokenList;

      // Filter by token name if provided
      if (params?.tokenName) {
        filteredList = filteredList.filter(
          (token: any) =>
            token.name
              ?.toLowerCase()
              .includes(params.tokenName!.toLowerCase()) ||
            token.symbol
              ?.toLowerCase()
              .includes(params.tokenName!.toLowerCase()),
        );
      }

      // Filter by token address if provided (takes precedence over name)
      if (params?.tokenAddress) {
        filteredList = filteredList.filter(
          (token: any) =>
            token.address?.toLowerCase() === params.tokenAddress!.toLowerCase(),
        );
      }

      // Only include chains that have matching tokens
      if (filteredList.length > 0) {
        filteredTokens[Number(chainId)] = filteredList;
      }
    }
  });

  // Transform to simplified list format
  const tokenList: Array<{
    name: string;
    symbol: string;
    address: string;
    chainId: number;
    logoURI?: string;
  }> = [];

  Object.entries(filteredTokens).forEach(([chainId, tokens]) => {
    tokens.forEach((token: any) => {
      tokenList.push({
        name: token.name || "",
        symbol: token.symbol || "",
        address: token.address || "",
        chainId: Number(chainId),
        logoURI: token.logoURI,
      });
    });
  });

  return { tokens: tokenList, length: tokenList.length };
};
