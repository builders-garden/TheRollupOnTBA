import type { CreateTip, Tip, UpdateTip } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface TipsApiResponse {
  success: boolean;
  data: Tip[] | Array<{ tip: Tip; brand: any }>;
}

interface TipApiResponse {
  success: boolean;
  data: Tip;
}

// Query hooks
export const useTips = (params?: {
  brandId?: string;
  withBrand?: boolean;
  recent?: number;
  payoutAddress?: string;
  ensName?: string;
  baseName?: string;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.brandId) searchParams.set("brandId", params.brandId);
  if (params?.withBrand)
    searchParams.set("withBrand", params.withBrand.toString());
  if (params?.recent) searchParams.set("recent", params.recent.toString());
  if (params?.payoutAddress)
    searchParams.set("payoutAddress", params.payoutAddress);
  if (params?.ensName) searchParams.set("ensName", params.ensName);
  if (params?.baseName) searchParams.set("baseName", params.baseName);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/tips${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<TipsApiResponse>({
    queryKey: ["tips", params],
    url,
    isProtected: true,
  });
};

export const useTip = (tipId: string) => {
  return useApiQuery<TipApiResponse>({
    queryKey: ["tips", tipId],
    url: `/api/tips/${tipId}`,
    enabled: !!tipId,
    isProtected: true,
  });
};

// Mutation hooks
export const useCreateTip = () => {
  return useApiMutation<TipApiResponse, CreateTip>({
    url: "/api/tips",
    method: "POST",
    body: (variables) => variables,
  });
};

export const useUpdateTip = () => {
  return useApiMutation<TipApiResponse, { tipId: string } & UpdateTip>({
    url: (variables) => `/api/tips/${variables.tipId}`,
    method: "PUT",
    body: ({ tipId, ...data }) => data,
  });
};

export const useDeleteTip = () => {
  return useApiMutation<
    { success: boolean; message: string },
    { tipId: string }
  >({
    url: (variables) => `/api/tips/${variables.tipId}`,
    method: "DELETE",
  });
};
