import { NextRequest, NextResponse } from "next/server";
import {
  Token,
  TokensApiError,
  TokensApiResponse,
} from "@/lib/types/tokens.type";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // Get query parameters
    const chainId = searchParams.get("chain_id");
    const searchQuery = searchParams.get("search_query");
    const tokenAddress = searchParams.get("token_address");
    const pageSize = searchParams.get("page_size") || "20";
    const currency = searchParams.get("currency") || "usd";
    const sort = searchParams.get("sort") || "-market_data.market_cap";

    // Build the API URL
    const baseUrl = "https://api.zerion.io/v1/fungibles/";
    const params = new URLSearchParams({
      currency,
      "page[size]": pageSize,
      sort,
    });

    // Add optional filters
    if (chainId) {
      params.append("filter[implementation_chain_id]", chainId);
    }

    if (searchQuery) {
      params.append("filter[search_query]", searchQuery);
    }

    if (tokenAddress) {
      params.append("filter[implementation_address]", tokenAddress);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;

    // Make the API call to Zerion
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Basic ${process.env.ZERION_API_KEY || ""}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Zerion API error: ${response.status} ${response.statusText}`,
      );
      return NextResponse.json(
        { success: false, error: `API request failed: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Transform the data to only include the required fields
    const transformedData: Token[] =
      data.data?.map((token: any) => ({
        name: token.attributes.name,
        symbol: token.attributes.symbol,
        iconUrl: token.attributes.icon?.url,
        chainId: token.attributes.implementations?.[0]?.chain_id,
        address: token.attributes.implementations?.[0]?.address,
        decimals: token.attributes.implementations?.[0]?.decimals,
      })) || [];

    const result: TokensApiResponse = {
      success: true,
      data: transformedData,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Zerion API error:", error);
    const errorResponse: TokensApiError = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};
