import { AuthTokenType } from "@/lib/enums";
import { useApiQuery } from "./use-api-query";

interface BrandAnalyticsMetrics {
  totalTips: number;
  totalAmount: number;
  uniqueTippers: number;
}

interface BrandAnalyticsMetricsResponse {
  data: BrandAnalyticsMetrics;
}

export const useBrandAnalyticsMetrics = (tokenType: AuthTokenType) => {
  return useApiQuery<BrandAnalyticsMetricsResponse>({
    queryKey: ["brand-analytics-metrics"],
    url: "/api/brands/analytics/metrics",
    enabled: true,
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
