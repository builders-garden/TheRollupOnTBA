import type { CreateTip, Tip, UpdateTip } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

interface TipApiResponse {
  success: boolean;
  data: Tip;
}

// Query hooks
export const useTips = (params?: {
  brandId?: string;
  payoutAddress?: string;
  ensName?: string;
  baseName?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.brandId) searchParams.set("brandId", params.brandId);
  if (params?.payoutAddress)
    searchParams.set("payoutAddress", params.payoutAddress);
  if (params?.ensName) searchParams.set("ensName", params.ensName);
  if (params?.baseName) searchParams.set("baseName", params.baseName);

  const queryString = searchParams.toString();
  const url = `/api/tips${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<TipApiResponse>({
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
