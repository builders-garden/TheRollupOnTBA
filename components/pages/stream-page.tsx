"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { Bullmeter } from "@/plugins/bullmeter/bullmeter";
import { FeaturedTokens } from "@/plugins/featured-tokens/featured-tokens";
import { Tips } from "@/plugins/tips/tips";
import { BottomNavbar } from "../custom-ui/mini-app/bottom-navbar";
import { ShareButton } from "../custom-ui/share-button";
import { Separator } from "../shadcn-ui/separator";

export const StreamPage = () => {
  const { joinStream } = useSocketUtils();
  const { isConnected } = useSocket();

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
            <h1 className="shrink-0 font-extrabold text-[20px]">
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
            { amount: 0.5, onClick: () => {}, buttonColor: "blue" },
            { amount: 1, onClick: () => {}, buttonColor: "blue" },
            { amount: 3, onClick: () => {}, buttonColor: "blue" },
            { amount: 5, onClick: () => {}, buttonColor: "blue" },
            { amount: 10, onClick: () => {}, buttonColor: "blue" },
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
      </div>
      {/* Floating Bottom Navbar */}
      <BottomNavbar />
    </motion.div>
  );
};
