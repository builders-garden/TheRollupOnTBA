import { AuthTokenType } from "@/lib/enums";
import { useApiQuery } from "./use-api-query";

// Generic types common to all analytics
interface BrandAnalyticsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Tips analytics types
interface TipsAnalyticsUser {
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

interface TipsAnalyticsSort {
  field: "totalTips" | "totalAmount" | "firstTip" | "lastTip";
  direction: "asc" | "desc";
}

interface TipsAnalyticsResponse {
  data: TipsAnalyticsUser[];
  pagination: BrandAnalyticsPagination;
  sort: TipsAnalyticsSort;
}

interface UseTipsAnalyticsOptions {
  page?: number;
  limit?: number;
  sortBy?: TipsAnalyticsSort["field"];
  sortDir?: TipsAnalyticsSort["direction"];
  enabled?: boolean;
  tokenType: AuthTokenType;
  brandId?: string;
}

// Polls analytics types
interface PollsAnalyticsUser {
  userId: string;
  username: string | null;
  farcasterUsername: string | null;
  farcasterDisplayName: string | null;
  farcasterAvatarUrl: string | null;
  totalVotes: number;
  totalAmount: number;
  firstVote: string;
  lastVote: string;
}

interface PollsAnalyticsSort {
  field: "totalVotes" | "totalAmount" | "firstVote" | "lastVote";
  direction: "asc" | "desc";
}

interface PollsAnalyticsResponse {
  data: PollsAnalyticsUser[];
  pagination: BrandAnalyticsPagination;
  sort: PollsAnalyticsSort;
}

interface UsePollsAnalyticsOptions {
  page?: number;
  limit?: number;
  sortBy?: PollsAnalyticsSort["field"];
  sortDir?: PollsAnalyticsSort["direction"];
  enabled?: boolean;
  tokenType: AuthTokenType;
  brandId?: string;
}

// Tips analytics hook
export const useTipsAnalytics = ({
  page = 1,
  limit = 10,
  sortBy = "totalAmount",
  sortDir = "desc",
  enabled = true,
  brandId,
  tokenType,
}: UseTipsAnalyticsOptions) => {
  return useApiQuery<TipsAnalyticsResponse>({
    queryKey: ["tips-analytics", page, limit, sortBy, sortDir],
    url: `/api/analytics/${brandId}/tips?page=${page}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`,
    enabled,
    isProtected: true,
    // Cache analytics data for 5 minutes
    staleTime: 5 * 60 * 1000,
    tokenType,
  });
};

// Polls analytics hook
export const usePollsAnalytics = ({
  page = 1,
  limit = 10,
  sortBy = "totalAmount",
  sortDir = "desc",
  enabled = true,
  brandId,
  tokenType,
}: UsePollsAnalyticsOptions) => {
  return useApiQuery<PollsAnalyticsResponse>({
    queryKey: ["polls-analytics", page, limit, sortBy, sortDir],
    url: `/api/analytics/${brandId}/polls?page=${page}&limit=${limit}&sortBy=${sortBy}&sortDir=${sortDir}`,
    enabled,
    isProtected: true,
    // Cache analytics data for 5 minutes
    staleTime: 5 * 60 * 1000,
    tokenType,
  });
};
