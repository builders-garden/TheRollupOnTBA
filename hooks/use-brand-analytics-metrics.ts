import { AuthTokenType } from "@/lib/enums";
import { useApiQuery } from "./use-api-query";

// Generic types common to all analytics metrics
interface UseBrandAnalyticsMetricsOptions {
  tokenType: AuthTokenType;
  brandId?: string;
  enabled?: boolean;
}

// Tips analytics metrics types
interface TipsAnalyticsMetrics {
  totalTips: number;
  totalAmount: number;
  uniqueTippers: number;
}

interface TipsAnalyticsMetricsResponse {
  data: TipsAnalyticsMetrics;
}

// Polls analytics metrics types
interface PollsAnalyticsMetrics {
  totalVotes: number;
  totalAmount: number;
  uniqueVoters: number;
}

interface PollsAnalyticsMetricsResponse {
  data: PollsAnalyticsMetrics;
}

// Tips analytics metrics hook
export const useTipsAnalyticsMetrics = ({
  tokenType,
  brandId,
  enabled,
}: UseBrandAnalyticsMetricsOptions) => {
  return useApiQuery<TipsAnalyticsMetricsResponse>({
    queryKey: ["tips-analytics-metrics", brandId],
    url: `/api/analytics/${brandId}/tips/metrics`,
    enabled,
    isProtected: true,
    // Cache metrics data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Prevent automatic refetching when window regains focus
    refetchOnWindowFocus: false,
    // Prevent automatic background refresh
    refetchInterval: false,
    tokenType,
  });
};

// Polls analytics metrics hook
export const usePollsAnalyticsMetrics = ({
  tokenType,
  brandId,
  enabled,
}: UseBrandAnalyticsMetricsOptions) => {
  return useApiQuery<PollsAnalyticsMetricsResponse>({
    queryKey: ["polls-analytics-metrics", brandId],
    url: `/api/analytics/${brandId}/polls/metrics`,
    enabled,
    isProtected: true,
    staleTime: 5 * 60 * 1000,
    tokenType,
  });
};
