import type {
  BullMeter,
  CreateBullMeter,
  UpdateBullMeter,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface BullMetersApiResponse {
  success: boolean;
  data: BullMeter[] | Array<{ bullMeter: BullMeter; brand: any }>;
}

interface BullMeterApiResponse {
  success: boolean;
  data: BullMeter;
}

// Query hooks
export const useBullMeters = (
  tokenType: AuthTokenType,
  params?: {
    brandId?: string;
    withBrand?: boolean;
    recent?: number;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
  },
) => {
  const searchParams = new URLSearchParams();
  if (params?.brandId) searchParams.set("brandId", params.brandId);
  if (params?.withBrand)
    searchParams.set("withBrand", params.withBrand.toString());
  if (params?.recent) searchParams.set("recent", params.recent.toString());
  if (params?.minDuration)
    searchParams.set("minDuration", params.minDuration.toString());
  if (params?.maxDuration)
    searchParams.set("maxDuration", params.maxDuration.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/bullmeters${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<BullMetersApiResponse>({
    queryKey: ["bullmeters", params],
    url,
    isProtected: true,
    tokenType,
  });
};

export const useBullMeter = (tokenType: AuthTokenType, bullMeterId: string) => {
  return useApiQuery<BullMeterApiResponse>({
    queryKey: ["bullmeters", bullMeterId],
    url: `/api/bullmeters/${bullMeterId}`,
    enabled: !!bullMeterId,
    isProtected: true,
    tokenType,
  });
};

export const useActiveBullMeter = (brandId: string) => {
  return useApiQuery<BullMeterApiResponse>({
    queryKey: ["active-bullmeter", brandId],
    url: `/api/bullmeters/active/${brandId}`,
    enabled: !!brandId,
    isProtected: true,
    tokenType: null,
  });
};

// Mutation hooks
export const useCreateBullMeter = (tokenType: AuthTokenType) => {
  return useApiMutation<BullMeterApiResponse, CreateBullMeter>({
    url: "/api/bullmeters",
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};

export const useUpdateBullMeter = (tokenType: AuthTokenType) => {
  return useApiMutation<
    BullMeterApiResponse,
    { bullMeterId: string } & UpdateBullMeter
  >({
    url: (variables) => `/api/bullmeters/${variables.bullMeterId}`,
    method: "PUT",
    body: ({ bullMeterId, ...data }) => data,
    tokenType,
  });
};

export const useDeleteBullMeter = (tokenType: AuthTokenType) => {
  return useApiMutation<
    { success: boolean; message: string },
    { bullMeterId: string }
  >({
    url: (variables) => `/api/bullmeters/${variables.bullMeterId}`,
    method: "DELETE",
    tokenType,
  });
};
