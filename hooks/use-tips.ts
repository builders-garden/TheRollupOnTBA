import type { CreateTip, Tip } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

interface TipApiResponse {
  success: boolean;
  data: Tip;
}

// Mutation hooks
export const useCreateTip = () => {
  return useApiMutation<TipApiResponse, CreateTip>({
    url: "/api/tips",
    method: "POST",
    body: (variables) => variables,
  });
};
