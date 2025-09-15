"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import { useApprove } from "@/hooks/use-approve";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useBullmeterApprove } from "@/hooks/use-bullmeter-approve";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { THE_ROLLUP_HOSTS } from "@/lib/constants";
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
import { ShareButton } from "../custom-ui/share-button";
import { Separator } from "../shadcn-ui/separator";

export const StreamPage = () => {
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const { joinStream, voteCasted } = useSocketUtils();
  const { brand, user } = useMiniAppAuth();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({
    duration: 250,
  });

  // Get active bullmeter poll for this brand
  const { data: activePoll, isLoading: isPollLoading } = useActiveBullMeter(
    brand.data?.id || "",
  );

  // State for real-time countdown
  const [timeLeft, setTimeLeft] = useState("0:00");

  // State to track which button is loading
  const [loadingButton, setLoadingButton] = useState<"bear" | "bull" | null>(
    null,
  );

  // Show/hide state for the Bullmeter poll card
  const [showPoll, setShowPoll] = useState<boolean>(false);

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
  const [poll, setPoll] = useState<NormalizedPoll | null>(null);

  const handleStreamJoined = (data: StreamJoinedEvent) => {};

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
      const absoluteDeadline = Math.floor(
        new Date(data.endTime).getTime() / 1000,
      );
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
      deadlineSeconds: Math.floor(new Date(data.endTime).getTime() / 1000), // This is already correct - absolute timestamp
      votes: data.votes,
      voters: data.voters,
      results: data.results,
    });
  };

  useEffect(() => {
    if (isConnected) {
      joinStream({
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

  const baseName = user.data?.wallets.find(
    (wallet) => wallet.baseName,
  )?.baseName;

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
    checkAllowance,
  } = useApprove({ amount: "1" });

  // BullMeter voting hook
  const {
    submitVote,
    isPending: isVoting,
    isError: voteError,
  } = useBullmeterApprove({
    onSuccess: (data) => {
      voteCasted({
        position: PopupPositions.TOP_CENTER,
        username:
          baseName || user.data?.username || formatWalletAddress(address),
        profilePicture: user.data?.avatarUrl || "",
        voteAmount: "1",
        isBull: data.data?.isYes || false,
        promptId: poll?.pollId || "",
        endTime: data.data?.endTime
          ? (() => {
              // Convert Unix timestamp (seconds) to milliseconds
              const date = new Date(data.data?.endTime * 1000);
              return date;
            })()
          : new Date(),
      });
    },
  });

  // Handle vote submission with approval check
  const handleVote = async (isBull: boolean) => {
    const buttonType = isBull ? "bull" : "bear";

    // Guard: poll must exist, not expired, and have an id
    const now = Math.floor(Date.now() / 1000);
    const isExpired = poll?.deadlineSeconds
      ? poll.deadlineSeconds - now <= 0
      : true;

    if (!poll?.pollId || isExpired) {
      console.error("❌ No active poll found");
      return;
    }

    try {
      // Set loading state for the specific button
      setLoadingButton(buttonType);

      // Check current allowance and get the actual value
      const currentAllowance = await checkAllowance();

      // Parse the required amount
      const requiredAmount = BigInt(10000); // 0.01 USDC in wei
      const hasEnoughAllowance =
        currentAllowance && currentAllowance >= requiredAmount;

      // If not approved, approve first
      if (!hasEnoughAllowance) {
        await approve();
      }

      // Extract the hash from the pollId URL
      const pollHash = poll.pollId.includes("/poll/")
        ? poll.pollId.split("/poll/")[1]
        : poll.pollId;

      // Submit the vote
      await submitVote(pollHash, isBull, "1");

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
      {brand.data?.youtubeLiveUrl ? (
        <iframe
          width="100%"
          height="265px"
          src={brand.data.youtubeLiveUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div className="flex justify-center items-center w-full h-[265px] bg-gray-400">
          <p className="text-sm">No Livestream found, try again later!</p>
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex flex-col justify-start items-center h-full w-full px-5 py-5 pb-[82px] gap-5">
        {/* Title */}
        <div className="flex flex-col justify-center items-center w-full gap-0.5">
          <div className="flex justify-between items-center w-full">
            <h1 className="shrink-0 font-extrabold text-xl">
              {brand.data?.streamTitle || `The Rollup Streaming`}
            </h1>
            <ShareButton
              linkCopied
              miniappUrl={env.NEXT_PUBLIC_URL}
              buttonClassName="shrink-1 w-min cursor-pointer"
            />
          </div>
          {brand.data?.logoUrl && (
            <div className="flex justify-start items-center w-full gap-1.5">
              <p className="text-sm">by</p>
              <Image
                src={brand.data.logoUrl}
                alt={brand.data.name || ""}
                width={20}
                height={21}
                className="rounded-[4px]"
              />
              <p className="text-md">{brand.data.name}</p>
            </div>
          )}
        </div>

        <Separator className="w-full bg-border" />

        {/* Bullmeter Poll Card - Controlled by showPoll state */}
        {showPoll && poll && (
          <>
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
              button1OnClick={() => handleVote(false)} // Bear vote
              button2OnClick={() => handleVote(true)} // Bull vote
              disabled={isApproving || isVoting}
              loading={isApproving || isVoting}
              button1Loading={loadingButton === "bear"}
              button2Loading={loadingButton === "bull"}
            />

            {/* Error Messages */}
            {voteError && (
              <p className="text-red-500 text-sm text-center">
                Vote failed. Please try again.
              </p>
            )}
          </>
        )}

        {/* Tip Buttons */}
        {brand.tipSettings.data?.payoutAddress && (
          <Tips
            showLabel
            tips={[
              { amount: 0.5, buttonColor: "blue" },
              { amount: 1, buttonColor: "blue" },
              { amount: 3, buttonColor: "blue" },
            ]}
            customTipButton={{
              color: "blue",
              text: "Custom",
            }}
            payoutAddress={brand.tipSettings.data.payoutAddress}
            user={user.data}
          />
        )}

        {/* Featured Tokens */}
        <FeaturedTokens
          tokens={brand.featuredTokens.data || []}
          user={user.data}
        />

        {/* About Section */}
        <AboutSection
          label="About"
          text={brand.data?.description || ""}
          coverUrl={brand.data?.coverUrl || ""}
          youtubeUrl={brand.data?.socialMediaUrls?.youtube || ""}
          twitchUrl={brand.data?.socialMediaUrls?.twitch || ""}
          twitterUrl={brand.data?.socialMediaUrls?.x || ""}
          websiteUrl={brand.data?.websiteUrl || ""}
        />

        {/* Hosts Section */}
        <HostsSection hosts={THE_ROLLUP_HOSTS} label="Hosts" />

        {/* Newsletter CTA */}
        <NewsletterCTA label="Subscribe to newsletter" />
      </div>
      {/* Floating Bottom Navbar */}
      {user.data && <BottomNavbar user={user.data} />}
    </motion.div>
  );
};
