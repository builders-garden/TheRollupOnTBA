import { ExternalLink, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { useMiniApp } from "@/contexts/mini-app-context";
import { useApprove } from "@/hooks/use-approve";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useConsumeBullmeterApprove } from "@/hooks/use-bullmeter-approve";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { FARCASTER_CLIENT_FID } from "@/lib/constants";
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
import { createFarcasterIntentUrl } from "@/lib/utils/farcaster";
import { env } from "@/lib/zod";
import { MiniAppBullmeter } from "@/plugins/mini-app/bullmeter/mini-app-bullmeter";
import { NBButton } from "../nb-button";
import { NBModal } from "../nb-modal";

interface MiniAppPollCardProps {
  brand: Brand;
  user: User;
}

export const MiniAppPollCard = ({ brand, user }: MiniAppPollCardProps) => {
  const { context } = useMiniApp();
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({
    duration: 250,
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

  // USDC approval hook
  const {
    approve,
    isLoading: isApproving,
    isError: isApprovingError,
    checkAllowance,
  } = useApprove({ amount: "1", source: "mini-app" });

  // Get the base name of the user
  const baseName = user.wallets.find((wallet) => wallet.baseName)?.baseName;

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
        username: user.username || "",
        profilePicture: user.avatarUrl || "",
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
    tokenType: AuthTokenType.MINI_APP_AUTH_TOKEN,
  });

  // Handle vote submission with approval check
  const handleVote = async (
    isBull: boolean,
    votesNumber: number,
    launchedByModal: boolean = false,
  ) => {
    const buttonType = isBull ? "bull" : "bear";

    // Guard: poll must exist, not expired, and have an id
    const now = Math.floor(Date.now() / 1000);
    const isExpired = poll?.deadlineSeconds
      ? poll.deadlineSeconds - now <= 0
      : true;

    if (!poll?.pollId || isExpired) {
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
          await approve();
          currentAllowance = await checkAllowance();
          hasEnoughAllowance =
            currentAllowance && currentAllowance >= requiredAmount;
          if (!hasEnoughAllowance) {
            return;
          }
          setIsApproveModalOpen(false);
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
      await submitVote(pollHash, isBull, votesNumber.toString(), {
        senderId: user.id,
        receiverBrandId: brand.id,
        platform:
          context?.client.clientFid === FARCASTER_CLIENT_FID.farcaster
            ? "farcaster"
            : "base",
        username: baseName || user.username || formatWalletAddress(address),
        position: PopupPositions.TOP_CENTER,
        profilePicture: user.avatarUrl || "",
        endTimeMs: poll.deadlineSeconds
          ? poll.deadlineSeconds * 1000
          : undefined,
      });

      toast.success("Vote submitted", {
        action: {
          label: (
            <div className="flex justify-center items-center gap-1.5">
              <p>Share</p>
              <ExternalLink className="size-3" />
            </div>
          ),
          onClick: () => {
            createFarcasterIntentUrl(
              `I just voted a poll in ${brand.name}'s livestream!`,
              `${env.NEXT_PUBLIC_URL}/${brand.slug}`,
            );
          },
        },
        duration: 10000, // 10 seconds
      });

      startConfetti();
    } catch (error) {
      toast.error("Vote failed. Please try again.");
    } finally {
      // Clear loading state
      setLoadingButton(null);
    }
  };

  return (
    <div className="flex justify-center items-start w-full">
      {showPoll && poll && (
        <MiniAppBullmeter
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

      {/* Bullmeter Approve Modal */}
      <NBModal
        trigger={<div />}
        isOpen={isApproveModalOpen}
        setIsOpen={setIsApproveModalOpen}
        contentClassName="p-4 sm:p-6 rounded-[12px] sm:max-w-2xl">
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
              {!showPoll ? (
                <motion.p
                  key="approve-and-vote-text"
                  className="text-base font-extrabold text-white">
                  Poll is closed
                </motion.p>
              ) : isApproving || isVoting ? (
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
