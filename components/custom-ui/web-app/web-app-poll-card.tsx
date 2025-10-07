import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { useApprove } from "@/hooks/use-approve";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useConsumeBullmeterApprove } from "@/hooks/use-bullmeter-approve";
import { useCreateBullmeterVote } from "@/hooks/use-bullmeter-votes";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { Brand } from "@/lib/database/db.schema";
import {
  AuthTokenType,
  PopupPositions,
  ServerToClientSocketEvents,
} from "@/lib/enums";
import { NormalizedPoll } from "@/lib/types/bullmeter.type";
import {
  EndPollNotificationEvent,
  PollNotificationEvent,
  StreamJoinedEvent,
  UpdatePollNotificationEvent,
} from "@/lib/types/socket";
import { User } from "@/lib/types/user.type";
import { calculateTimeLeft, formatWalletAddress } from "@/lib/utils";
import { WebAppBullmeter } from "@/plugins/web-app/bullmeter/web-app-bullmeter";
import { NBButton } from "../nb-button";
import { NBModal } from "../nb-modal";

interface WebAppPollCardProps {
  brand: Brand;
  user?: User;
}

export const WebAppPollCard = ({ brand, user }: WebAppPollCardProps) => {
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const { joinStream, voteCasted } = useSocketUtils();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({
    duration: 500,
  });

  // Show/hide state for the Bullmeter poll card
  const [showPoll, setShowPoll] = useState<boolean>(false);

  // State for real-time countdown
  const [timeLeft, setTimeLeft] = useState("0:00");

  // State to track the poll
  const [poll, setPoll] = useState<NormalizedPoll | null>(null);

  // Get active bullmeter poll for this brand
  const { data: activePoll, isLoading: isPollLoading } = useActiveBullMeter(
    brand.id,
  );

  // State to track which button is loading
  const [loadingButton, setLoadingButton] = useState<"bear" | "bull" | null>(
    null,
  );

  // State to track the number of votes
  const [currentVotesNumber, setCurrentVotesNumber] = useState<number>(0);

  // State to track the approve modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);

  // Approving state
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // USDC approval hook
  const {
    approve,
    isError: isApprovingError,
    checkAllowance,
  } = useApprove({ amount: "1", source: "web-app" });

  // Get the base name of the user
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Update countdown every second
  useEffect(() => {
    if (!poll?.deadlineSeconds) return;

    const updateTimer = () => {
      if (!poll?.deadlineSeconds) {
        setTimeLeft("0:00");
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = poll.deadlineSeconds - now;
      if (secondsLeft <= 0) {
        setTimeLeft("0:00");
        setShowPoll(false);
        return;
      }
      setTimeLeft(calculateTimeLeft(poll.deadlineSeconds));
    };

    // Update immediately
    updateTimer();

    // Set up interval for updates
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [poll?.deadlineSeconds]);

  // Seed poll state from the initially fetched active poll
  useEffect(() => {
    if (isPollLoading) return;
    if (activePoll?.data) {
      const deadlineSeconds = activePoll.data.deadline || null;
      const now = Math.floor(Date.now() / 1000);
      const isExpired = !!deadlineSeconds && deadlineSeconds - now <= 0;

      setPoll({
        id: activePoll.data.id,
        prompt: activePoll.data.prompt,
        pollId: activePoll.data.pollId,
        deadlineSeconds,
        votes:
          (activePoll.data.totalYesVotes || 0) +
          (activePoll.data.totalNoVotes || 0),
        voters: undefined,
        results: {
          bullPercent: activePoll.data.totalYesVotes || 0,
          bearPercent: activePoll.data.totalNoVotes || 0,
        },
      });
      setShowPoll(!isExpired);
    } else {
      setShowPoll(false);
      setPoll(null);
    }
  }, [isPollLoading, activePoll?.data]);

  // When the component mounts, join the stream and subscribe to the socket events
  useEffect(() => {
    if (isConnected) {
      joinStream({
        brandId: brand.id,
        username: user?.username || "",
        profilePicture: user?.avatarUrl || "",
      });
    }

    subscribe(ServerToClientSocketEvents.STREAM_JOINED, handleStreamJoined);
    subscribe(
      ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL,
      handleUpdateSentimentPoll,
    );
    subscribe(
      ServerToClientSocketEvents.START_SENTIMENT_POLL,
      handleStartSentimentPoll,
    );
    subscribe(
      ServerToClientSocketEvents.END_SENTIMENT_POLL,
      handleEndSentimentPoll,
    );

    return () => {
      unsubscribe(ServerToClientSocketEvents.STREAM_JOINED, handleStreamJoined);
      unsubscribe(
        ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL,
        handleUpdateSentimentPoll,
      );
      unsubscribe(
        ServerToClientSocketEvents.START_SENTIMENT_POLL,
        handleStartSentimentPoll,
      );
      unsubscribe(
        ServerToClientSocketEvents.END_SENTIMENT_POLL,
        handleEndSentimentPoll,
      );
    };
  }, [isConnected, joinStream]);

  // Handle the stream joined event
  const handleStreamJoined = (_: StreamJoinedEvent) => {};

  // Handle the update sentiment poll event
  const handleUpdateSentimentPoll = (data: UpdatePollNotificationEvent) => {
    setShowPoll(true);
    setPoll((prev) => {
      const base: NormalizedPoll = prev ?? {
        id: data.id,
        prompt: "",
        pollId: undefined,
        deadlineSeconds: null,
        votes: undefined,
        voters: undefined,
        results: undefined,
      };
      // Store the absolute Unix timestamp, not remaining time
      const absoluteDeadline = Math.floor(data.endTimeMs / 1000);
      return {
        ...base,
        id: data.id,
        votes: data.votes,
        voters: data.voters,
        results: data.results,
        deadlineSeconds: absoluteDeadline, // Store absolute timestamp, not remaining time
      };
    });
  };

  const handleEndSentimentPoll = (data: EndPollNotificationEvent) => {
    setShowPoll(false);
    setPoll((prev) =>
      prev?.id === data.id
        ? {
            ...prev,
            votes: data.votes,
            voters: data.voters,
            results: data.results,
          }
        : prev,
    );
  };

  const handleStartSentimentPoll = (data: PollNotificationEvent) => {
    setShowPoll(true);
    setPoll({
      id: data.id,
      prompt: data.pollQuestion,
      pollId: data.qrCodeUrl,
      deadlineSeconds: Math.floor(data.endTimeMs / 1000),
      votes: data.votes,
      voters: data.voters,
      results: data.results,
    });
  };

  // BullMeter voting hook
  const { submitVote, isPending: isVoting } = useConsumeBullmeterApprove({
    onSuccess: async (data) => {
      const voteCount = data.data?.voteCount;
      if (!voteCount || voteCount === "0" || isNaN(Number(voteCount))) return;

      // Get the platform from the context
      const platform = "web-app";

      // Create the bullmeter vote if the pollId is available
      if (poll?.pollId && brand.id && user?.id) {
        createBullmeterVote({
          pollId: poll.pollId as Address,
          isBull: data.data?.isYes ?? false,
          votes: Number(voteCount),
          votePrice: "0.01",
          platform,
          senderId: user.id,
          receiverBrandId: brand.id,
        });
      }

      // Cast the votes to the socket in order to show them as popups in the overlay
      for (let i = 0; i < Number(voteCount); i++) {
        voteCasted({
          brandId: brand.id,
          position: PopupPositions.TOP_CENTER,
          username: baseName || user?.username || formatWalletAddress(address),
          profilePicture: user?.avatarUrl || "",
          voteAmount: "1",
          isBull: data.data?.isYes ?? false,
          promptId: poll?.pollId || "",
          endTimeMs: data.data?.endTime
            ? (() => {
                // Convert Unix timestamp (seconds) to milliseconds
                const date = new Date(data.data?.endTime * 1000);
                return date.getTime();
              })()
            : new Date().getTime(),
        });

        // Wait for 1 second before sending the next vote
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    },
    tokenType: AuthTokenType.WEB_APP_AUTH_TOKEN,
  });

  // Bullmeter votes creation hook
  const { mutate: createBullmeterVote } = useCreateBullmeterVote(
    AuthTokenType.WEB_APP_AUTH_TOKEN,
  );

  // Handle vote submission with approval check
  const handleVote = async (
    isBull: boolean,
    votesNumber: number,
    launchedByModal: boolean = false,
  ) => {
    if (!address) {
      toast.info("Please connect your wallet to vote");
      return;
    }

    const buttonType = isBull ? "bull" : "bear";

    // Guard: poll must exist, not expired, and have an id
    const now = Math.floor(Date.now() / 1000);
    const isExpired = poll?.deadlineSeconds
      ? poll.deadlineSeconds - now <= 0
      : true;

    if (!poll?.pollId || isExpired) {
      console.log("❌ No active poll found");
      return;
    }

    try {
      // Set loading state for the specific button
      setLoadingButton(buttonType);

      // Set the current votes number
      setCurrentVotesNumber(votesNumber);

      // Check current allowance and get the actual value
      let currentAllowance = await checkAllowance();

      // Parse the required amount
      const requiredAmount = BigInt(10000 * votesNumber); // 0.01 * votesNumber USDC in wei
      let hasEnoughAllowance =
        currentAllowance && currentAllowance >= requiredAmount;

      // Get the local storage preference set by the user
      const dontShowApproveModal = localStorage.getItem("dontShowApproveModal");

      // If not approved, approve first
      if (!hasEnoughAllowance) {
        if (dontShowApproveModal || launchedByModal) {
          setIsApproving(true);
          await approve();
          // 5 seconds to ensure the transaction is fully processed
          await new Promise((resolve) => setTimeout(resolve, 5000));
          currentAllowance = await checkAllowance();
          hasEnoughAllowance =
            currentAllowance && currentAllowance >= requiredAmount;
          if (!hasEnoughAllowance) {
            setIsApproving(false);
            return;
          }
          setIsApproveModalOpen(false);
          setIsApproving(false);
        } else {
          setIsApproveModalOpen(true);
          return;
        }
      }

      if (isApprovingError) {
        toast.error("Approval failed. Please try again.");
        return;
      }

      // Extract the hash from the pollId URL
      const pollHash = poll.pollId.includes("/poll/")
        ? poll.pollId.split("/poll/")[1]
        : poll.pollId;

      // Submit the vote
      await submitVote(pollHash, isBull, votesNumber.toString());

      toast.success("Vote submitted");
      startConfetti();
    } catch (error) {
      console.log("❌ Vote failed:", error);
      toast.error("Vote failed. Please try again.");
    } finally {
      // Clear loading state
      setLoadingButton(null);
      setIsApproving(false);
    }
  };

  return (
    <div className="flex justify-center items-start w-full">
      <AnimatePresence mode="wait">
        {showPoll && poll && (
          <WebAppBullmeter
            title={poll.prompt}
            showLabel
            timeLeft={timeLeft}
            votePrice={0.01}
            deadlineSeconds={poll.deadlineSeconds || undefined}
            button1text="Bear"
            button2text="Bull"
            button1Color="destructive"
            button2Color="success"
            button1OnClick={(votesNumber) => handleVote(false, votesNumber)} // Bear vote
            button2OnClick={(votesNumber) => handleVote(true, votesNumber)} // Bull vote
            disabled={isApproving || isVoting}
            loading={isApproving || isVoting}
            button1Loading={loadingButton === "bear"}
            button2Loading={loadingButton === "bull"}
          />
        )}
      </AnimatePresence>

      {/* Bullmeter Approve Modal */}
      <NBModal
        trigger={<div />}
        isOpen={isApproveModalOpen}
        setIsOpen={setIsApproveModalOpen}>
        <h1 className="text-base font-extrabold w-full text-center">
          Approve USDC to Vote
        </h1>
        <p className="text-sm text-center">
          You will approve the spending amount of <b>$1.00</b> and have the
          possibility to vote <b>100 times</b>.
          <br />
          Feel free to spam as much as you want!
        </p>

        <div className="flex justify-center items-center w-full gap-1 my-1.5">
          <Checkbox
            onCheckedChange={(checked) => {
              if (checked) {
                // Set a state to remember the user don't want to see the modal anymore in the local storage
                localStorage.setItem("dontShowApproveModal", "true");
              } else {
                // Remove the state from the local storage
                localStorage.removeItem("dontShowApproveModal");
              }
            }}
            className="size-6 data-[state=checked]:bg-accent data-[state=checked]:border-accent mx-1.5"
          />
          <p className="text-sm">Don&apos;t show this again</p>
        </div>

        <div className="flex flex-col justify-center items-center w-full mt-2 gap-5">
          <NBButton
            className="w-full bg-accent h-[42px]"
            disabled={isApproving || isVoting || !showPoll}
            onClick={async () => {
              if (!showPoll) {
                return;
              }
              const isBull = loadingButton === "bull";
              await handleVote(isBull, currentVotesNumber, true);
            }}>
            <AnimatePresence mode="wait">
              {isApproving || isVoting ? (
                <motion.div
                  key="approve-and-vote-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-white animate-spin" />
                </motion.div>
              ) : (
                <motion.p
                  key="approve-and-vote-text"
                  className="text-base font-extrabold text-white">
                  Approve and Vote
                </motion.p>
              )}
            </AnimatePresence>
          </NBButton>
          <button
            className="text-base font-bold text-black cursor-pointer"
            onClick={() => setIsApproveModalOpen(false)}>
            Cancel
          </button>
        </div>
      </NBModal>
    </div>
  );
};
