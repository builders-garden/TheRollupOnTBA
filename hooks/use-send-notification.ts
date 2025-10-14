import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";

interface SendBrandNotificationApiResponse {
  message: string;
  successfulTokens: string[];
  invalidTokens: string[];
  rateLimitedTokens: string[];
  errorFids: string[];
}

interface SendBrandNotificationApiVariables {
  title: string;
  body: string;
  targetUrl?: string;
}

// Mutation hooks
export const useSendBrandNotification = (
  tokenType: AuthTokenType,
  brandId: string,
) => {
  return useApiMutation<
    SendBrandNotificationApiResponse,
    SendBrandNotificationApiVariables
  >({
    url: `/api/notify/${brandId}`,
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};
