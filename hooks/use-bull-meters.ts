import type {
  BullMeter,
  CreateBullMeter,
  UpdateBullMeter,
} from "@/lib/database/db.schema";
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
export const useBullMeters = (params?: {
  brandId?: string;
  withBrand?: boolean;
  recent?: number;
  minDuration?: number;
  maxDuration?: number;
  limit?: number;
}) => {
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
  const url = `/api/bull-meters${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<BullMetersApiResponse>({
    queryKey: ["bull-meters", params],
    url,
    isProtected: true,
  });
};

export const useBullMeter = (bullMeterId: string) => {
  return useApiQuery<BullMeterApiResponse>({
    queryKey: ["bull-meters", bullMeterId],
    url: `/api/bull-meters/${bullMeterId}`,
    enabled: !!bullMeterId,
    isProtected: true,
  });
};

// Mutation hooks
export const useCreateBullMeter = () => {
  return useApiMutation<BullMeterApiResponse, CreateBullMeter>({
    url: "/api/bull-meters",
    method: "POST",
    body: (variables) => variables,
  });
};

export const useUpdateBullMeter = () => {
  return useApiMutation<
    BullMeterApiResponse,
    { bullMeterId: string } & UpdateBullMeter
  >({
    url: (variables) => `/api/bull-meters/${variables.bullMeterId}`,
    method: "PUT",
    body: ({ bullMeterId, ...data }) => data,
  });
};

export const useDeleteBullMeter = () => {
  return useApiMutation<
    { success: boolean; message: string },
    { bullMeterId: string }
  >({
    url: (variables) => `/api/bull-meters/${variables.bullMeterId}`,
    method: "DELETE",
  });
};
