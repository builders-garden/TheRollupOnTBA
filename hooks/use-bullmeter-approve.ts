import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";

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
  };
  error?: string;
  details?: string;
}

const executeVote = async (voteData: VoteRequest): Promise<VoteResponse> => {
  const response = await fetch("/api/execute-bullmeters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(voteData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useBullmeterApprove = () => {
  const { address } = useAccount();

  console.log("address:", address);


  const voteMutation = useMutation({
    mutationFn: executeVote,
    onSuccess: (data) => {
      console.log("Vote submitted successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to submit vote:", error);
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
