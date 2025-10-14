import {
  BrandNotification,
  CreateBrandNotification,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

interface BrandNotificationsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface CreateBrandNotificationApiResponse {
  success: boolean;
  data: BrandNotification;
}

interface BrandNotificationsApiResponse {
  success: boolean;
  data: BrandNotification[];
  pagination: BrandNotificationsPagination;
}

interface UseBrandNotificationsByBrandIdOptions {
  tokenType: AuthTokenType;
  brandId?: string;
  page: number;
  limit: number;
}

export const useBrandNotificationsByBrandId = ({
  tokenType,
  brandId,
  page = 1,
  limit = 10,
}: UseBrandNotificationsByBrandIdOptions) => {
  return useApiQuery<BrandNotificationsApiResponse>({
    url: `/api/brand-notifications/${brandId}?page=${page}&limit=${limit}`,
    tokenType,
    queryKey: ["brand-notifications", brandId, page, limit],
    enabled: !!brandId,
    isProtected: true,
  });
};

// Mutation hooks
export const useCreateBrandNotification = (
  tokenType: AuthTokenType,
  brandId: string,
) => {
  return useApiMutation<
    CreateBrandNotificationApiResponse,
    Omit<CreateBrandNotification, "brandId">
  >({
    url: `/api/brand-notifications/${brandId}`,
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};
