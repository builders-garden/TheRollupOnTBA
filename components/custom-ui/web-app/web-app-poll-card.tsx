import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { useApprove } from "@/hooks/use-approve";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useConsumeBullmeterApprove } from "@/hooks/use-bullmeter-approve";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
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
import { calculateTimeLeft, cn, formatWalletAddress } from "@/lib/utils";
import { WebAppBullmeter } from "@/plugins/web-app/bullmeter/web-app-bullmeter";
import { CancelButton } from "../cancel-button";
import { CTSButton } from "../cts-button";
import { CTSModal } from "../cts-modal";
import { TheRollupButton } from "../tr-button";

interface WebAppPollCardProps {
  brand: Brand;
  user?: User;
}

export const WebAppPollCard = ({ brand, user }: WebAppPollCardProps) => {
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();
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

      const pollData = {
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
      };

      setPoll(pollData);
      setShowPoll(!isExpired);
    } else {
      setShowPoll(false);
      setPoll(null);
    }
  }, [isPollLoading, activePoll?.data]);

  // When the component mounts, join the stream and subscribe to the socket events
  useEffect(() => {
    if (isConnected) {
      const streamData = {
        brandId: brand.id,
        username: user?.username || "",
        profilePicture: user?.avatarUrl || "",
      };

      joinStream(streamData);
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
    const newPoll = {
      id: data.id,
      prompt: data.pollQuestion,
      pollId: data.qrCodeUrl,
      deadlineSeconds: Math.floor(data.endTimeMs / 1000),
      votes: data.votes,
      voters: data.voters,
      results: data.results,
    };

    setShowPoll(true);
    setPoll(newPoll);
  };

  // BullMeter voting hook
  const { submitVote, isPending: isVoting } = useConsumeBullmeterApprove({
    tokenType: AuthTokenType.WEB_APP_AUTH_TOKEN,
  });

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
    if (!user?.id) {
      return;
    }

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

      const voteData = {
        senderId: user.id,
        receiverBrandId: brand.id,
        platform: "web-app",
        username: baseName || user?.username || formatWalletAddress(address),
        position: PopupPositions.TOP_CENTER,
        profilePicture: user?.avatarUrl || "",
        endTimeMs: poll.deadlineSeconds
          ? poll.deadlineSeconds * 1000
          : undefined,
      };

      // Submit the vote
      await submitVote(pollHash, isBull, votesNumber.toString(), voteData);

      toast.success("Vote submitted");
      startConfetti();
    } catch (error) {
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
      <CTSModal
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
            className={cn(
              "size-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary mx-1.5",
              brand.slug === THE_ROLLUP_BRAND_SLUG &&
                "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
            )}
          />
          <p className="text-sm">Don&apos;t show this again</p>
        </div>

        <div className="flex flex-col justify-center items-center w-full mt-2 gap-2">
          {brand.slug === THE_ROLLUP_BRAND_SLUG ? (
            <TheRollupButton
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
                    className="text-base font-extrabold text-foreground">
                    Poll is closed
                  </motion.p>
                ) : isApproving || isVoting ? (
                  <motion.div
                    key="approve-and-vote-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}>
                    <Loader2 className="size-5 text-foreground animate-spin" />
                  </motion.div>
                ) : (
                  <motion.p
                    key="approve-and-vote-text"
                    className="text-base font-extrabold text-foreground">
                    Approve and Vote
                  </motion.p>
                )}
              </AnimatePresence>
            </TheRollupButton>
          ) : (
            <CTSButton
              className="w-full h-[42px]"
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
                    className="text-base font-extrabold text-background">
                    Poll is closed
                  </motion.p>
                ) : isApproving || isVoting ? (
                  <motion.div
                    key="approve-and-vote-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}>
                    <Loader2 className="size-5 text-background animate-spin" />
                  </motion.div>
                ) : (
                  <motion.p
                    key="approve-and-vote-text"
                    className="text-base font-extrabold text-background">
                    Approve and Vote
                  </motion.p>
                )}
              </AnimatePresence>
            </CTSButton>
          )}
          {brand.slug === THE_ROLLUP_BRAND_SLUG ? (
            <button
              className="text-base font-bold text-black cursor-pointer mt-3"
              onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </button>
          ) : (
            <CancelButton onClick={() => setIsApproveModalOpen(false)} />
          )}
        </div>
      </CTSModal>
    </div>
  );
};
