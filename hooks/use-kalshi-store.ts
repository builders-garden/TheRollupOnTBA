import { KalshiApiResult } from "@/lib/types/kalshi.type";
import { useApiMutation } from "./use-api-mutation";

// Types for API responses
type KalshiGetApiResponse = KalshiApiResult;

interface KalshiStoreApiResponse {
  success: boolean;
  data: {
    eventId: string;
    totalMarkets: number;
    message: string;
  };
}

// Request types
interface KalshiGetRequest {
  url: string;
}

interface KalshiStoreRequest {
  brandId: string;
  kalshiData: {
    eventTitle: string;
    totalMarkets: number;
  };
  kalshiUrl: string;
}

// Mutation hooks
export const useKalshiGet = () => {
  return useApiMutation<KalshiGetApiResponse, KalshiGetRequest>({
    url: "/api/kalshi/get",
    method: "POST",
    body: (variables) => variables,
    tokenType: null, // No authentication required for getting Kalshi data
  });
};

export const useKalshiStore = () => {
  return useApiMutation<KalshiStoreApiResponse, KalshiStoreRequest>({
    url: "/api/kalshi/store",
    method: "POST",
    body: (variables) => variables,
    tokenType: null, // Authentication is handled via headers in the API
  });
};
