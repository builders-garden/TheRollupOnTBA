import type {
  BullmeterVote,
  CreateBullmeterVote,
} from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";

interface BullmeterVoteApiResponse {
  success: boolean;
  data: BullmeterVote;
}

// Mutation hooks
export const useCreateBullmeterVote = () => {
  return useApiMutation<BullmeterVoteApiResponse, CreateBullmeterVote>({
    url: "/api/bullmeter-votes",
    method: "POST",
    body: (variables) => variables,
  });
};
