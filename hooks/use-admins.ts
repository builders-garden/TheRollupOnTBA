import type { Admin, CreateAdmin } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface AdminsApiResponse {
  success: boolean;
  data: Admin[];
}

interface AdminApiResponse {
  success: boolean;
  data: Admin;
}

// Query hooks
export const useAdminsByBrandId = ({
  brandId,
  enabled,
  tokenType,
}: {
  brandId?: string;
  enabled: boolean;
  tokenType: AuthTokenType;
}) => {
  return useApiQuery<AdminsApiResponse>({
    queryKey: ["admins", brandId],
    url: `/api/admins?brandId=${brandId}`,
    enabled: enabled,
    isProtected: true,
    tokenType,
  });
};

// Mutation hooks
export const useCreateAdmin = (tokenType: AuthTokenType) => {
  return useApiMutation<AdminApiResponse, CreateAdmin>({
    url: "/api/admins",
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};

export const useDeleteAdmin = (tokenType: AuthTokenType) => {
  return useApiMutation<
    { success: boolean; message: string },
    { brandId: string; address: string }
  >({
    url: (variables) => `/api/admins/${variables.brandId}/${variables.address}`,
    method: "DELETE",
    tokenType,
  });
};
