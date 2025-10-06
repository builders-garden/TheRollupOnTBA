import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";

interface NewsletterResponse {
  error?: string;
}

interface NewsletterVariables {
  email: string;
}

export const useSubscribeNewsletter = (tokenType: AuthTokenType) => {
  return useApiMutation<NewsletterResponse, NewsletterVariables>({
    url: "/api/newsletter/subscribe",
    method: "POST",
    body: (variables) => ({ email: variables.email }),
    isProtected: true,
    tokenType,
  });
};
