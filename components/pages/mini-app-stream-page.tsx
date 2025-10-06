"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import { useApprove } from "@/hooks/use-approve";
import { useLastYoutubeContent } from "@/hooks/use-last-youtube-content";
import { THE_ROLLUP_HOSTS } from "@/lib/constants";
import { env } from "@/lib/zod";
import { FeaturedTokens } from "@/plugins/featured-tokens/featured-tokens";
import { Tips } from "@/plugins/tips/tips";
import { BottomNavbar } from "../custom-ui/mini-app/bottom-navbar";
import { HostsSection } from "../custom-ui/mini-app/hosts";
import { MiniAppAboutSection } from "../custom-ui/mini-app/mini-app-about-section";
import { NewsletterCTA } from "../custom-ui/mini-app/newsletter-cta";
import { PollCard } from "../custom-ui/mini-app/poll-card";
import { ShareButton } from "../custom-ui/share-button";
import { Separator } from "../shadcn-ui/separator";
import { Skeleton } from "../shadcn-ui/skeleton";

export const MiniAppStreamPage = () => {
  const { brand, user } = useMiniAppAuth();

  // Get the last youtube content for this brand
  const { data: lastYoutubeContent, isLoading: isLastYoutubeContentLoading } =
    useLastYoutubeContent(brand.data?.slug || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col justify-center items-start h-full w-full no-scrollbar">
      <div className="flex justify-center items-center w-full h-[265px] bg-gray-300">
        <AnimatePresence mode="wait">
          {isLastYoutubeContentLoading ? (
            <motion.div
              key="youtube-stream-video-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex justify-center items-center size-full">
              <Loader2 className="size-7 text-black animate-spin" />
            </motion.div>
          ) : lastYoutubeContent?.data?.url ? (
            <motion.div
              key="youtube-stream-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
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
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col justify-center items-center w-full gap-0.5">
                <div className="flex justify-between items-center w-full gap-6">
                  <h1 className="font-extrabold text-xl">
                    {lastYoutubeContent?.data?.title || ""}
                  </h1>
                  <ShareButton
                    miniappUrl={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                    copyLinkText={`cbwallet://miniapp?url=${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                    buttonClassName="shrink-1 w-min cursor-pointer"
                  />
                </div>
                <div className="flex justify-start items-center w-full gap-2.5">
                  {brand.data?.name && (
                    <div className="flex justify-start items-center w-fit gap-1.5">
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
                  {lastYoutubeContent?.data?.isLive && (
                    <motion.div
                      className="flex justify-start items-center w-full gap-0.5"
                      animate={{ opacity: [0.15, 1, 1, 1, 0.15] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}>
                      <div className="size-[7px] bg-destructive rounded-full" />
                      <p className="text-xs text-destructive font-bold">LIVE</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        <Separator className="w-full bg-border" />

        {/* Poll Card */}
        {brand.data && user.data && (
          <PollCard brand={brand.data} user={user.data} />
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
        <MiniAppAboutSection
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
    </motion.div>
  );
};
