import type { CreateTip, Tip } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { useApiMutation } from "./use-api-mutation";

interface TipApiResponse {
  success: boolean;
  data: Tip;
}

// Mutation hooks
export const useCreateTip = (tokenType: AuthTokenType) => {
  return useApiMutation<TipApiResponse, CreateTip>({
    url: "/api/tips",
    method: "POST",
    body: (variables) => variables,
    tokenType,
  });
};
