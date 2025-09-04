export interface Token {
  name: string;
  symbol: string;
  iconUrl?: string;
  chainId?: string;
  address?: string;
  decimals?: number;
}

export interface TokensApiResponse {
  success: boolean;
  data: Token[];
}

export interface TokensApiError {
  success: false;
  error: string;
}
