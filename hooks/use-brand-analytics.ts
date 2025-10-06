import { AuthTokenType } from "@/lib/enums";
import { useApiQuery } from "./use-api-query";

interface BrandAnalyticsUser {
  userId: string;
  username: string | null;
  farcasterUsername: string | null;
  farcasterDisplayName: string | null;
  farcasterAvatarUrl: string | null;
  totalTips: number;
  totalAmount: number;
  firstTip: string;
  lastTip: string;
}

interface BrandAnalyticsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface BrandAnalyticsSort {
  field: "totalTips" | "totalAmount" | "firstTip" | "lastTip";
  direction: "asc" | "desc";
}

interface BrandAnalyticsResponse {
  data: BrandAnalyticsUser[];
  pagination: BrandAnalyticsPagination;
  sort: BrandAnalyticsSort;
}

interface UseBrandAnalyticsOptions {
  page?: number;
  limit?: number;
  sortBy?: BrandAnalyticsSort["field"];
  sortDir?: BrandAnalyticsSort["direction"];
  enabled?: boolean;
  tokenType: AuthTokenType;
}

export const useBrandAnalytics = ({
  page = 1,
  limit = 10,
  sortBy = "totalAmount",
  sortDir = "desc",
  enabled = true,
  tokenType,
}: UseBrandAnalyticsOptions) => {
  return useApiQuery<BrandAnalyticsResponse>({
    queryKey: ["brand-analytics", page, limit, sortBy, sortDir],
    url: `/api/brands/analytics?page=${page}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`,
    enabled,
    isProtected: true,
    // Cache analytics data for 5 minutes
    staleTime: 5 * 60 * 1000,
    tokenType,
  });
};
