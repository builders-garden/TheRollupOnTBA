import type {
  CreateFeaturedToken,
  FeaturedToken,
  UpdateFeaturedToken,
} from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface FeaturedTokensApiResponse {
  success: boolean;
  data: FeaturedToken[] | Array<{ token: FeaturedToken; brand: any }>;
}

interface FeaturedTokenApiResponse {
  success: boolean;
  data: FeaturedToken;
}

// Query hooks
export const useFeaturedTokens = (params?: {
  brandId?: string;
  chainName?: number;
  active?: boolean;
  withBrand?: boolean;
  search?: string;
  address?: string;
  limit?: number;
  enabled?: boolean;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.brandId) searchParams.set("brandId", params.brandId);
  if (params?.chainName)
    searchParams.set("chainName", params.chainName.toString());
  if (params?.active !== undefined)
    searchParams.set("active", params.active.toString());
  if (params?.withBrand)
    searchParams.set("withBrand", params.withBrand.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.address) searchParams.set("address", params.address);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/featured-tokens${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<FeaturedTokensApiResponse>({
    queryKey: ["featured-tokens", params],
    url,
    isProtected: true,
    enabled: params?.enabled || true,
  });
};

export const useFeaturedToken = (tokenId: string) => {
  return useApiQuery<FeaturedTokenApiResponse>({
    queryKey: ["featured-tokens", tokenId],
    url: `/api/featured-tokens/${tokenId}`,
    enabled: !!tokenId,
    isProtected: true,
  });
};

// Mutation hooks
export const useCreateFeaturedTokens = () => {
  return useApiMutation<FeaturedTokenApiResponse, CreateFeaturedToken[]>({
    url: "/api/featured-tokens",
    method: "POST",
    body: (variables) => variables,
  });
};

export const useUpdateFeaturedToken = () => {
  return useApiMutation<
    FeaturedTokenApiResponse,
    { tokenId: string } & UpdateFeaturedToken
  >({
    url: (variables) => `/api/featured-tokens/${variables.tokenId}`,
    method: "PUT",
    body: ({ tokenId, ...data }) => data,
  });
};

export const useDeleteFeaturedToken = () => {
  return useApiMutation<
    { success: boolean; message: string },
    { tokenId: string }
  >({
    url: (variables) => `/api/featured-tokens/${variables.tokenId}`,
    method: "DELETE",
  });
};

export const useToggleFeaturedTokenActive = () => {
  return useApiMutation<FeaturedTokenApiResponse, { tokenId: string }>({
    url: (variables) => `/api/featured-tokens/${variables.tokenId}`,
    method: "PATCH",
    body: () => ({ action: "toggle-active" }),
  });
};
