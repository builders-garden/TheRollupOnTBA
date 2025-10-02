import type { Admin, CreateAdmin } from "@/lib/database/db.schema";
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
}: {
  brandId?: string;
  enabled: boolean;
}) => {
  return useApiQuery<AdminsApiResponse>({
    queryKey: ["admins", brandId],
    url: `/api/admins?brandId=${brandId}`,
    enabled: enabled,
    isProtected: true,
  });
};

// Mutation hooks
export const useCreateAdmin = () => {
  return useApiMutation<AdminApiResponse, CreateAdmin>({
    url: "/api/admins",
    method: "POST",
    body: (variables) => variables,
  });
};

export const useDeleteAdmin = () => {
  return useApiMutation<
    { success: boolean; message: string },
    { brandId: string; address: string }
  >({
    url: (variables) => `/api/admins/${variables.brandId}/${variables.address}`,
    method: "DELETE",
  });
};
