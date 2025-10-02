"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import { useMiniApp } from "@/contexts/mini-app-context";
import { useApprove } from "@/hooks/use-approve";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useBullmeterApprove } from "@/hooks/use-bullmeter-approve";
import { useCreateBullmeterVote } from "@/hooks/use-bullmeter-votes";
import { useConfetti } from "@/hooks/use-confetti";
import { useLastYoutubeContent } from "@/hooks/use-last-youtube-content";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { FARCASTER_CLIENT_FID, THE_ROLLUP_HOSTS } from "@/lib/constants";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import {
  EndPollNotificationEvent,
  PollNotificationEvent,
  StreamJoinedEvent,
  UpdatePollNotificationEvent,
} from "@/lib/types/socket";
import { formatWalletAddress } from "@/lib/utils";
import { env } from "@/lib/zod";
import { Bullmeter } from "@/plugins/bullmeter/bullmeter";
import { FeaturedTokens } from "@/plugins/featured-tokens/featured-tokens";
import { Tips } from "@/plugins/tips/tips";
import { AboutSection } from "../custom-ui/mini-app/about-section";
import { BottomNavbar } from "../custom-ui/mini-app/bottom-navbar";
import { HostsSection } from "../custom-ui/mini-app/hosts";
import { NewsletterCTA } from "../custom-ui/mini-app/newsletter-cta";
import { NBButton } from "../custom-ui/nb-button";
import { NBModal } from "../custom-ui/nb-modal";
import { ShareButton } from "../custom-ui/share-button";
import { Checkbox } from "../shadcn-ui/checkbox";
import { Separator } from "../shadcn-ui/separator";
import { Skeleton } from "../shadcn-ui/skeleton";

// Unified poll state populated from initial fetch and socket updates
type NormalizedPoll = {
  id: string;
  prompt: string;
  pollId?: string;
  deadlineSeconds: number | null;
  votes?: number;
  voters?: number;
  results?: { bullPercent: number; bearPercent: number };
};

export const StreamPage = () => {
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const { context } = useMiniApp();
  const { joinStream, voteCasted } = useSocketUtils();
  const { brand, user } = useMiniAppAuth();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({
    duration: 250,
  });

  // Get the last youtube content for this brand
  const { data: lastYoutubeContent, isLoading: isLastYoutubeContentLoading } =
    useLastYoutubeContent(brand.data?.slug || "");

  // Get active bullmeter poll for this brand
  const { data: activePoll, isLoading: isPollLoading } = useActiveBullMeter(
    brand.data?.id || "",
  );

  // Get the base name of the user
  const baseName = user.data?.wallets.find(
    (wallet) => wallet.baseName,
  )?.baseName;

  // State for real-time countdown
  const [timeLeft, setTimeLeft] = useState("0:00");

  // State to track which button is loading
  const [loadingButton, setLoadingButton] = useState<"bear" | "bull" | null>(
    null,
  );

  // State to track the number of votes
  const [currentVotesNumber, setCurrentVotesNumber] = useState<number>(0);

  // State to track the approve modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);

  // Show/hide state for the Bullmeter poll card
  const [showPoll, setShowPoll] = useState<boolean>(false);

  // State to track the poll
  const [poll, setPoll] = useState<NormalizedPoll | null>(null);

  const handleStreamJoined = (_: StreamJoinedEvent) => {};

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

  useEffect(() => {
    if (isConnected) {
      joinStream({
        brandId: brand.data?.id || "",
        username: user.data?.username || "",
        profilePicture: user.data?.avatarUrl || "",
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

  // Helper function to calculate time left
  const calculateTimeLeft = (deadline: number | null) => {
    if (!deadline) return "0:00";
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = deadline - now;
    if (timeLeft <= 0) return "0:00";
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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

  // USDC approval hook
  const {
    approve,
    isLoading: isApproving,
    isError: isApprovingError,
    checkAllowance,
  } = useApprove({ amount: "1" });

  // BullMeter voting hook
  const { submitVote, isPending: isVoting } = useBullmeterApprove({
    onSuccess: async (data) => {
      const voteCount = data.data?.voteCount;
      if (!voteCount || voteCount === "0" || isNaN(Number(voteCount))) return;

      // Get the platform from the context
      const platform =
        context?.client.clientFid === FARCASTER_CLIENT_FID.farcaster
          ? "farcaster"
          : "base";

      // Create the bullmeter vote if the pollId is available
      if (poll?.pollId && brand.data?.id && user.data?.id) {
        createBullmeterVote({
          pollId: poll.pollId as Address,
          isBull: data.data?.isYes ?? false,
          votes: Number(voteCount),
          votePrice: "0.01",
          platform,
          senderId: user.data.id,
          receiverBrandId: brand.data.id,
        });
      }

      // Cast the votes to the socket in order to show them as popups in the overlay
      for (let i = 0; i < Number(voteCount); i++) {
        voteCasted({
          brandId: brand.data?.id || "",
          position: PopupPositions.TOP_CENTER,
          username:
            baseName || user.data?.username || formatWalletAddress(address),
          profilePicture: user.data?.avatarUrl || "",
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
  });

  // Bullmeter votes creation hook
  const { mutate: createBullmeterVote } = useCreateBullmeterVote();

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
      await submitVote(pollHash, isBull, votesNumber.toString());

      toast.success("Vote submitted");
      startConfetti();
    } catch (error) {
      console.log("❌ Vote failed:", error);
      toast.error("Vote failed. Please try again.");
    } finally {
      // Clear loading state
      setLoadingButton(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col justify-center items-start h-full w-full no-scrollbar">
      <div className="flex justify-center items-center w-full h-[265px] bg-gray-300">
        <AnimatePresence mode="wait">
          {isLastYoutubeContentLoading ? (
            <motion.div
              key="youtube-stream-video-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex justify-center items-center size-full">
              <Loader2 className="size-7 text-black animate-spin" />
            </motion.div>
          ) : lastYoutubeContent?.data?.url ? (
            <motion.div
              key="youtube-stream-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="size-full">
              <iframe
                width="100%"
                height="265px"
                src={lastYoutubeContent.data.url}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </motion.div>
          ) : (
            <motion.div
              key="youtube-stream-video-not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex justify-center items-center size-full">
              <p className="text-sm font-bold text-center">
                No Livestream found
                <br />
                try again later!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col justify-start items-center h-full w-full px-5 py-5 pb-[82px] gap-5">
        {/* Title */}

        <AnimatePresence mode="wait">
          {isLastYoutubeContentLoading ? (
            <motion.div
              key="stream-title-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col justify-center items-center w-full gap-0.5">
              <Skeleton className="w-full h-[54px] bg-black/10" />
            </motion.div>
          ) : (
            lastYoutubeContent?.data?.title && (
              <motion.div
                key="stream-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col justify-center items-center w-full gap-0.5">
                <div className="flex justify-between items-center w-full">
                  <h1 className="font-extrabold text-xl">
                    {lastYoutubeContent?.data?.title || ""}
                  </h1>
                  <ShareButton
                    miniappUrl={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                    copyLinkText={`cbwallet://miniapp?url=${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                    buttonClassName="shrink-1 w-min cursor-pointer"
                  />
                </div>
                {brand.data?.name && (
                  <div className="flex justify-start items-center w-full gap-1.5">
                    <p className="text-sm">by</p>
                    {brand.data?.logoUrl && (
                      <Image
                        src={brand.data.logoUrl}
                        alt={brand.data.name}
                        width={21}
                        height={21}
                        className="rounded-[4px]"
                      />
                    )}
                    <p className="text-md">{brand.data.name}</p>
                  </div>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>

        <Separator className="w-full bg-border" />

        {/* Bullmeter Poll Card - Controlled by showPoll state */}
        {showPoll && poll && (
          <Bullmeter
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

        {/* Tip Buttons */}
        {brand.tipSettings.data?.payoutAddress && (
          <Tips
            showLabel
            tips={[
              { amount: 0.01, buttonColor: "blue" },
              { amount: 0.25, buttonColor: "blue" },
              { amount: 1, buttonColor: "blue" },
            ]}
            customTipButton={{
              color: "blue",
              text: "Custom",
            }}
            tipSettings={brand.tipSettings.data}
            user={user.data}
          />
        )}

        {/* Featured Tokens */}
        {brand.featuredTokens.data && brand.featuredTokens.data.length > 0 && (
          <FeaturedTokens tokens={brand.featuredTokens.data} user={user.data} />
        )}

        {/* About Section */}
        <AboutSection
          label="About"
          text={brand.data?.description || "No description provided"}
          coverUrl={brand.data?.coverUrl || ""}
          youtubeUrl={
            brand.data?.youtubeChannelId
              ? `https://www.youtube.com/channel/${brand.data?.youtubeChannelId}`
              : undefined
          }
          twitchUrl={brand.data?.socialMediaUrls?.twitch || ""}
          twitterUrl={brand.data?.socialMediaUrls?.x || ""}
          websiteUrl={brand.data?.websiteUrl || ""}
        />

        {/* Hosts Section */}
        {/* TODO: Make this dynamic */}
        {brand.data?.slug === "the_rollup" && (
          <HostsSection hosts={THE_ROLLUP_HOSTS} label="Hosts" />
        )}

        {/* Newsletter CTA */}
        {/* TODO: Make this dynamic */}
        {brand.data?.slug === "the_rollup" && (
          <NewsletterCTA label="Subscribe to newsletter" />
        )}
      </div>
      {/* Floating Bottom Navbar */}
      {user.data && <BottomNavbar user={user.data} />}

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
    </motion.div>
  );
};
