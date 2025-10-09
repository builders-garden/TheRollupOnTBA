import type { CreateHost, Host } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface HostsApiResponse {
  success: boolean;
  data: Host[];
}

interface HostApiResponse {
  success: boolean;
  data: Host;
}

// Query hooks
export const useHostsByBrandId = ({
  brandId,
  enabled,
}: {
  brandId?: string;
  enabled: boolean;
}) => {
  return useApiQuery<HostsApiResponse>({
    queryKey: ["hosts", brandId],
    url: `/api/hosts?brandId=${brandId}`,
    enabled: enabled,
    isProtected: true,
    tokenType: null,
  });
};

// Mutation hooks
export const useCreateHost = (tokenType: AuthTokenType) => {
  return useApiMutation<HostApiResponse, CreateHost>({
    url: "/api/hosts",
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};

export const useDeleteHost = (tokenType: AuthTokenType) => {
  return useApiMutation<
    { success: boolean; message: string },
    { brandId: string; fid: number }
  >({
    url: (variables) => `/api/hosts/${variables.brandId}/${variables.fid}`,
    method: "DELETE",
    tokenType,
  });
};
