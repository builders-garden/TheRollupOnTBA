"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import { useApprove } from "@/hooks/use-approve";
import { useBullmeterApprove } from "@/hooks/use-bullmeter-approve";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { Bullmeter } from "@/plugins/bullmeter/bullmeter";
import { FeaturedTokens } from "@/plugins/featured-tokens/featured-tokens";
import { Tips } from "@/plugins/tips/tips";
import { AboutSection } from "../custom-ui/mini-app/about-section";
import { BottomNavbar } from "../custom-ui/mini-app/bottom-navbar";
import { NewsletterCTA } from "../custom-ui/mini-app/newsletter-cta";
import { NBButton } from "../custom-ui/nb-button";
import { ShareButton } from "../custom-ui/share-button";
import { Separator } from "../shadcn-ui/separator";

export const StreamPage = () => {
  const { joinStream } = useSocketUtils();
  const { isConnected } = useSocket();

  // USDC approval hook
  const {
    approve,
    isLoading: isApproving,
    isSuccess: isApproved,
    hasError: approveError,
  } = useApprove({ amount: "1" });

  // BullMeter voting hook
  const {
    submitVote,
    isPending: isVoting,
    isSuccess: voteSuccess,
    isError: voteError,
  } = useBullmeterApprove();

  useEffect(() => {
    if (isConnected) {
      joinStream({
        username: "John Doe",
        profilePicture: "https://via.placeholder.com/150",
      });
    }
  }, [isConnected, joinStream]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col justify-center items-start h-full w-full">
      <iframe
        width="100%"
        height="265px"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=cBiXzo8PUe3GQ7dx"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />

      {/* Bottom Section */}
      <div className="flex flex-col justify-start items-center h-full w-full px-5 py-5 pb-[82px] gap-5">
        {/* Title */}
        <div className="flex flex-col justify-center items-center w-full gap-0.5">
          <div className="flex justify-between items-center w-full">
            <h1 className="shrink-0 font-extrabold text-xl">
              The Memecoin Rug Problems
            </h1>
            <ShareButton
              linkCopied
              miniappUrl="https://farcaster.miniapp.builders"
              buttonClassName="shrink-1 w-min"
            />
          </div>
          <div className="flex justify-start items-center w-full gap-1.5">
            <p>by</p>
            <Image
              src="/images/rollup_logo.png"
              alt="Rollup Logo"
              width={96}
              height={21}
              className="h-auto"
            />
          </div>
        </div>

        <Separator className="w-full bg-border" />

        {/* Bullmeter Poll Card */}
        <Bullmeter
          title="ETH will flip BTC this cycle"
          showLabel
          timeLeft="4:05"
          button1text="Bear"
          button2text="Bull"
          button1Color="destructive"
          button2Color="success"
        />

        {/* Tip Buttons */}
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
        />

        {/* Featured Tokens */}
        <FeaturedTokens
          tokens={[
            { name: "LIMONE", color: "bg-yellow-500" },
            { name: "DRONE", color: "bg-black" },
            { name: "CASO", color: "bg-gray-500" },
          ]}
        />

        {/* About Section */}
        <AboutSection
          label="About"
          text="Tune in as we unpack why Ethereum isn't just a blockchain it's a lifestyle. From dank memes to rollup wars, we're breaking down the culture, the tech, and why everything (yes, even your cat pics) should settle on Base."
          youtubeUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          twitchUrl="https://www.twitch.tv/rollup"
          twitterUrl="https://x.com/rollup"
          websiteUrl="https://rollup.com"
        />

        {/* Newsletter CTA */}
        <NewsletterCTA label="Subscribe to newsletter" onClick={() => {}} />

        {/* USDC Approval Section */}
        <div className="flex flex-col justify-center items-center w-full gap-3">
          <h2 className="text-base font-bold">Vote on ETH vs BTC</h2>

          {!isApproved ? (
            <NBButton
              className="bg-green-600 w-fit"
              disabled={isApproving}
              onClick={approve}>
              <p className="text-base font-extrabold text-white">
                {isApproving ? "Approving..." : "APPROVE USDC"}
              </p>
            </NBButton>
          ) : (
            <div className="flex gap-3 w-full">
              <NBButton
                className="bg-red-600 flex-1"
                disabled={isVoting}
                onClick={() =>
                  submitVote(
                    "0xcff2903becf1ed83be5948521afdb292794c1f82c074ec4648129f4e5159a584", //TODO: Update this
                    false,
                    "1",
                  )
                }>
                <p className="text-base font-extrabold text-white">
                  {isVoting ? "Voting..." : "BEAR"}
                </p>
              </NBButton>
              <NBButton
                className="bg-green-600 flex-1"
                disabled={isVoting}
                onClick={() =>
                  submitVote(
                    "0xcff2903becf1ed83be5948521afdb292794c1f82c074ec4648129f4e5159a584", //TODO: Update this
                    true,
                    "1",
                  )
                }>
                <p className="text-base font-extrabold text-white">
                  {isVoting ? "Voting..." : "BULL"}
                </p>
              </NBButton>
            </div>
          )}

          {approveError && (
            <p className="text-red-500 text-sm">
              Approval failed. Please try again.
            </p>
          )}
          {voteError && (
            <p className="text-red-500 text-sm">
              Vote failed. Please try again.
            </p>
          )}
          {voteSuccess && (
            <p className="text-green-500 text-sm">
              Vote submitted successfully!
            </p>
          )}
        </div>
      </div>
      {/* Floating Bottom Navbar */}
      <BottomNavbar />
    </motion.div>
  );
};
