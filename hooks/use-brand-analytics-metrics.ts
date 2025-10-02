import { useApiQuery } from "./use-api-query";

interface BrandAnalyticsMetrics {
  totalTips: number;
  totalAmount: number;
  uniqueTippers: number;
}

interface BrandAnalyticsMetricsResponse {
  data: BrandAnalyticsMetrics;
}

export const useBrandAnalyticsMetrics = (enabled = true) => {
  return useApiQuery<BrandAnalyticsMetricsResponse>({
    queryKey: ["brand-analytics-metrics"],
    url: "/api/brands/analytics/metrics",
    enabled,
    isProtected: true,
    // Cache metrics data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Prevent automatic refetching when window regains focus
    refetchOnWindowFocus: false,
    // Prevent automatic background refresh
    refetchInterval: false,
  });
};
