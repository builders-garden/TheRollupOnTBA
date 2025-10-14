import { CreateNotificationSubscription } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

interface UseNotificationSubscriptionsAmountOptions {
  tokenType: AuthTokenType;
  brandId?: string;
  enabled?: boolean;
}

interface UseUserIsSubscribedToBrandOptions {
  tokenType: AuthTokenType;
  brandId?: string;
  userId?: string;
  enabled?: boolean;
}

interface UseMutateNotificationSubscriptionOptions {
  tokenType: AuthTokenType;
  brandId?: string;
  userId?: string;
}

interface NotificationSubscriptionsAmountResponse {
  data: number;
  success: boolean;
}

interface UseUserBrandSubscriptionResponse {
  data: boolean;
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

// Gets whether the user is subscribed to a brand
export const useUserIsSubscribedToBrand = ({
  tokenType,
  brandId,
  userId,
  enabled,
}: UseUserIsSubscribedToBrandOptions) => {
  return useApiQuery<UseUserBrandSubscriptionResponse>({
    queryKey: ["user-is-subscribed-to-brand", brandId, userId],
    url: `/api/notification-subscriptions/${brandId}/users/${userId}/is-subscribed`,
    enabled,
    isProtected: true,
    tokenType,
  });
};

// Creates a notification subscription
export const useCreateNotificationSubscription = ({
  tokenType,
  brandId,
  userId,
}: UseMutateNotificationSubscriptionOptions) => {
  return useApiMutation<
    UseUserBrandSubscriptionResponse,
    CreateNotificationSubscription
  >({
    url: `/api/notification-subscriptions/${brandId}/users/${userId}`,
    method: "POST",
    tokenType,
  });
};

// Deletes a notification subscription
export const useDeleteNotificationSubscription = ({
  tokenType,
  brandId,
  userId,
}: UseMutateNotificationSubscriptionOptions) => {
  return useApiMutation<
    UseUserBrandSubscriptionResponse,
    CreateNotificationSubscription
  >({
    url: `/api/notification-subscriptions/${brandId}/users/${userId}`,
    method: "DELETE",
    tokenType,
  });
};
