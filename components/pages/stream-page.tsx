"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import { useApprove } from "@/hooks/use-approve";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useBullmeterApprove } from "@/hooks/use-bullmeter-approve";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { env } from "@/lib/zod";
import { Bullmeter } from "@/plugins/bullmeter/bullmeter";
import { FeaturedTokens } from "@/plugins/featured-tokens/featured-tokens";
import { Tips } from "@/plugins/tips/tips";
import { AboutSection } from "../custom-ui/mini-app/about-section";
import { BottomNavbar } from "../custom-ui/mini-app/bottom-navbar";
import { NewsletterCTA } from "../custom-ui/mini-app/newsletter-cta";
import { ShareButton } from "../custom-ui/share-button";
import { Separator } from "../shadcn-ui/separator";

export const StreamPage = () => {
  const { joinStream } = useSocketUtils();
  const { isConnected } = useSocket();
  const { brand, user } = useMiniAppAuth();
  const { startConfetti } = useConfetti({
    duration: 250,
  });

  // Get active bullmeter poll for this brand
  const { data: activePoll, isLoading: isPollLoading } = useActiveBullMeter(
    brand.data?.id || "",
  );
  console.log("activePoll:", activePoll);
  console.log("brand.data?.id:", brand.data?.id);

  // State for real-time countdown
  const [timeLeft, setTimeLeft] = useState("0:00");

  // State to track which button is loading
  const [loadingButton, setLoadingButton] = useState<"bear" | "bull" | null>(
    null,
  );

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
    if (!activePoll?.data?.deadline) return;

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft(activePoll.data.deadline));
    };

    // Update immediately
    updateTimer();

    // Set up interval for updates
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activePoll?.data?.deadline]);

  // USDC approval hook
  const {
    approve,
    isLoading: isApproving,
    isSuccess: isApproved,
    hasError: approveError,
    currentAllowance,
    checkAllowance,
  } = useApprove({ amount: "1" });

  // BullMeter voting hook
  const {
    submitVote,
    isPending: isVoting,
    isSuccess: voteSuccess,
    isError: voteError,
  } = useBullmeterApprove();

  // Handle vote submission with approval check
  const handleVote = async (isBull: boolean) => {
    const buttonType = isBull ? "bull" : "bear";

    if (!activePoll?.data?.pollId) {
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

      // Submit the vote
      await submitVote(
        activePoll.data.pollId,
        isBull,
        "1", // 1 vote
      );

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

  useEffect(() => {
    if (isConnected) {
      joinStream({
        username: user.data?.username || "",
        profilePicture: user.data?.avatarUrl || "",
      });
    }
  }, [isConnected, joinStream]);

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
              />
              <p className="text-md">{brand.data.name}</p>
            </div>
          )}
        </div>

        <Separator className="w-full bg-border" />

        {/* Bullmeter Poll Card - Only show if there's an active poll */}
        {!isPollLoading && activePoll?.data && (
          <>
            <Bullmeter
              title={activePoll.data.prompt}
              showLabel
              timeLeft={timeLeft}
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
              { amount: 5, buttonColor: "blue" },
              { amount: 10, buttonColor: "blue" },
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
          youtubeUrl={brand.data?.socialMediaUrls?.youtube || ""}
          twitchUrl={brand.data?.socialMediaUrls?.twitch || ""}
          twitterUrl={brand.data?.socialMediaUrls?.x || ""}
          websiteUrl={brand.data?.websiteUrl || ""}
        />

        {/* Newsletter CTA */}
        <NewsletterCTA label="Subscribe to newsletter" />
      </div>
      {/* Floating Bottom Navbar */}
      {user.data && <BottomNavbar user={user.data} />}
    </motion.div>
  );
};
