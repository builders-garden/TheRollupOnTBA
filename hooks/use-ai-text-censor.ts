import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";

// Mutation hooks
export const useAiTextCensor = (tokenType: AuthTokenType) => {
  return useApiMutation<{ censoredText: string }, { text: string }>({
    url: "/api/ai-text-censor",
    method: "POST",
    body: (variables) => variables,
    tokenType,
    isProtected: true,
  });
};
