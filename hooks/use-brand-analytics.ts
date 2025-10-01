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

interface BrandAnalyticsResponse {
  data: BrandAnalyticsUser[];
  pagination: BrandAnalyticsPagination;
}

interface UseBrandAnalyticsOptions {
  brandSlug: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useBrandAnalytics = ({
  brandSlug,
  page = 1,
  limit = 10,
  enabled = true,
}: UseBrandAnalyticsOptions) => {
  return useApiQuery<BrandAnalyticsResponse>({
    queryKey: ["brand-analytics", brandSlug, page, limit],
    url: `/api/brands/${brandSlug}/analytics?page=${page}&limit=${limit}`,
    enabled,
    isProtected: true,
    // Cache analytics data for 5 minutes‘
    staleTime: 5 * 60 * 1000,
  });
};
