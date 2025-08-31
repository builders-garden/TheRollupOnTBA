import { useApiQuery } from "@/hooks/use-api-query";

export const useMantainance = () => {
  return useApiQuery<{ isInMantainance: boolean; mantainanceEndTime: string }>({
    queryKey: ["mantainance"],
    url: `/api/mantainance`,
    isProtected: true,
    refetchInterval: 1000 * 60 * 60, // 1 hour in milliseconds
  });
};
