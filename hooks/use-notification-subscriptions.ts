import { AuthTokenType } from "@/lib/enums";
import { useApiQuery } from "./use-api-query";

interface UseNotificationSubscriptionsAmountOptions {
  tokenType: AuthTokenType;
  brandId?: string;
  enabled?: boolean;
}

interface NotificationSubscriptionsAmountResponse {
  data: number;
  success: boolean;
}

// Gets the total number of notification subscriptions for a brand
export const useNotificationSubscriptionsAmount = ({
  tokenType,
  brandId,
  enabled,
}: UseNotificationSubscriptionsAmountOptions) => {
  return useApiQuery<NotificationSubscriptionsAmountResponse>({
    queryKey: ["notification-subscriptions-amount", brandId],
    url: `/api/notification-subscriptions/${brandId}/count`,
    enabled,
    isProtected: true,
    // Prevent automatic refetching when window regains focus
    refetchOnWindowFocus: false,
    // Prevent automatic background refresh
    refetchInterval: false,
    tokenType,
  });
};
