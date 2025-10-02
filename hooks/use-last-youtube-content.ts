import { useApiQuery } from "./use-api-query";

// Types for API responses
interface LastYoutubeContentResponse {
  success: boolean;
  data: {
    url: string;
    title: string;
    isLive: boolean;
  };
}

export const useLastYoutubeContent = (brandSlug: string) => {
  return useApiQuery<LastYoutubeContentResponse>({
    queryKey: ["last-youtube-content", brandSlug],
    url: `/api/last-youtube-content/${brandSlug}`,
    enabled: !!brandSlug,
    isProtected: true,
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};
