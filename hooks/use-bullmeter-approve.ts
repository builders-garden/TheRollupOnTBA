import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { useAccount } from "wagmi";
import { AuthTokenType } from "@/lib/enums";

interface VoteRequest {
  voter: string;
  pollId: string;
  isYes: boolean;
  voteCount: string;
}

interface VoteResponse {
  success: boolean;
  data?: {
    transactionHash: string;
    pollId: string;
    isYes: boolean;
    voteCount: string;
    message: string;
    endTime: number;
  };
  error?: string;
  details?: string;
}

const executeVote = async (
  voteData: VoteRequest,
  tokenType: AuthTokenType,
): Promise<VoteResponse> => {
  const response = await ky.post<VoteResponse>("/api/execute-bullmeters", {
    json: voteData,
    headers: {
      "x-token-type": tokenType,
    },
    timeout: false,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useConsumeBullmeterApprove = ({
  onSuccess,
  tokenType,
}: {
  onSuccess?: (data: VoteResponse) => void;
  tokenType: AuthTokenType;
}) => {
  const { address } = useAccount();

  const voteMutation = useMutation({
    mutationFn: (variables: VoteRequest) => executeVote(variables, tokenType),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      console.log("Failed to submit vote:", error);
    },
  });

  const submitVote = async (
    pollId: string,
    isYes: boolean,
    voteCount: string,
  ) => {
    if (!address) {
      throw new Error("No wallet connected");
    }
    return voteMutation.mutateAsync({
      voter: address,
      pollId,
      isYes,
      voteCount,
    });
  };

  return {
    submitVote,
    isPending: voteMutation.isPending,
    isError: voteMutation.isError,
    isSuccess: voteMutation.isSuccess,
    error: voteMutation.error,
    data: voteMutation.data,
  };
};
