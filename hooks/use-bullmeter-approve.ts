import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { useAccount } from "wagmi";
import { AuthTokenType } from "@/lib/enums";

interface VoteRequest {
  pollId: string;
  isBull: boolean;
  votes: string;
  votePrice: string;
  platform: string;
  senderId: string;
  voterAddress: string;
  receiverBrandId: string;
  // Optional fields
  username?: string;
  position?: string;
  profilePicture?: string;
  endTimeMs?: number;
}

interface VoteResponse {
  jobId: string;
  status: "queued";
  message: string;
  pollId: string;
}

const executeVote = async (
  voteData: VoteRequest,
  tokenType: AuthTokenType,
): Promise<VoteResponse> => {
  // Use the internal API endpoint instead of calling socket server directly
  const apiUrl = "/api/bullmeter/vote";

  try {
    const response = await ky.post<VoteResponse>(apiUrl, {
      json: voteData,
      headers: {
        "Content-Type": "application/json",
        "x-token-type": tokenType || "",
      },
      credentials: "include", // Include cookies for authentication
      timeout: 30000, // 30 second timeout
    });

    if (!response.ok) {
      console.error("❌ HTTP error! status:", response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("💥 Vote execution failed:", error);
    if (error instanceof Error) {
      console.error("💥 Error message:", error.message);
      console.error("💥 Error stack:", error.stack);
    }
    throw error;
  }
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
    additionalData: {
      senderId: string;
      receiverBrandId: string;
      platform?: string;
      username?: string;
      position?: string;
      profilePicture?: string;
      endTimeMs?: number;
    },
  ) => {
    if (!address) {
      throw new Error("No wallet connected");
    }
    return voteMutation.mutateAsync({
      voterAddress: address,
      pollId,
      isBull: isYes,
      votes: voteCount,
      votePrice: "0.01",
      platform: additionalData.platform || "mini-app",
      senderId: additionalData.senderId,
      receiverBrandId: additionalData.receiverBrandId,
      username: additionalData.username,
      position: additionalData.position,
      profilePicture: additionalData.profilePicture,
      endTimeMs: additionalData.endTimeMs,
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
