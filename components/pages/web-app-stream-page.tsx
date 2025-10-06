import { createAppKit, useAppKit } from "@reown/appkit/react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { basePreconf } from "viem/chains";
import { useAccount } from "wagmi";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { useLastYoutubeContent } from "@/hooks/use-last-youtube-content";
import { wagmiAdapter } from "@/lib/reown";
import { env } from "@/lib/zod";
import { LogoutButton } from "../custom-ui/logout-button";
import { NBButton } from "../custom-ui/nb-button";
import { NBCard } from "../custom-ui/nb-card";
import { ShareButton } from "../custom-ui/share-button";
import { WebAppAboutSection } from "../custom-ui/web-app/web-app-about-section";
import { ScrollArea } from "../shadcn-ui/scroll-area";
import { Skeleton } from "../shadcn-ui/skeleton";

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [basePreconf],
  defaultNetwork: basePreconf,
});

export const WebAppStreamPage = () => {
  const {
    brand,
    user,
    signInWithWebApp,
    isSigningIn,
    executeLogout,
    isLoggingOut,
  } = useWebAppAuth();
  const { address: connectedAddress } = useAccount();
  const { open } = useAppKit();

  // This state memorizes if the user was not connected before the page loaded
  const [wasNotConnected, setWasNotConnected] = useState(!connectedAddress);

  // Get the last youtube content for this brand
  const { data: lastYoutubeContent, isLoading: isLastYoutubeContentLoading } =
    useLastYoutubeContent(brand.data?.slug || "");

  // If the user was not connected before the page loaded
  // Automatically start the sign in process
  useEffect(() => {
    if (connectedAddress && wasNotConnected && !isSigningIn) {
      signInWithWebApp();
    }
  }, [connectedAddress]);

  // Handles the logout
  const handleLogout = () => {
    executeLogout();
    setWasNotConnected(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex justify-between items-center min-h-screen w-full">
      {/* Video and info area - scrollable vertically */}
      <ScrollArea scrollBarClassName="w-0" className="w-full">
        <div className="flex flex-col justify-start items-center h-screen w-full p-6 gap-5">
          {/* Video */}
          <div className="flex justify-center items-center min-h-[78%] aspect-video bg-gray-300 rounded-[8px] overflow-hidden">
            <AnimatePresence mode="wait">
              {isLastYoutubeContentLoading ? (
                <motion.div
                  key="youtube-stream-video-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex justify-center items-center size-full">
                  <Loader2 className="size-10 text-black animate-spin" />
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
                    height="100%"
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

          {/* Info */}
          <AnimatePresence mode="wait">
            {isLastYoutubeContentLoading ? (
              <motion.div
                key="youtube-stream-info-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex justify-center items-center size-full">
                <Skeleton className="w-full h-full bg-black/10" />
              </motion.div>
            ) : (
              <motion.div
                key="youtube-stream-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col justify-start items-center w-full gap-5">
                <div className="flex justify-between items-center w-full px-5">
                  <div className="flex justify-start items-center gap-5">
                    <div className="relative flex justify-center items-center bg-gray-500 rounded-full">
                      {brand.data?.logoUrl && (
                        <Image
                          src={brand.data?.logoUrl}
                          alt={brand.data?.name || ""}
                          width={86}
                          height={86}
                          className="rounded-full object-cover"
                        />
                      )}
                      {lastYoutubeContent?.data?.isLive && (
                        <div className="absolute inset-0 size-[86px] border-3 border-destructive rounded-full" />
                      )}
                      {lastYoutubeContent?.data?.isLive && (
                        <div className="absolute flex justify-center items-center -bottom-1 left-1/2 transform -translate-x-1/2 bg-destructive rounded-sm w-fit px-2 py-[1px]">
                          <p className="text-base text-white font-bold">LIVE</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center items-start gap-1 h-full">
                      <h1 className="text-3xl font-bold">
                        {lastYoutubeContent?.data?.title || ""}
                      </h1>
                      <p className="text-lg text-gray-500">
                        by {brand.data?.name}
                      </p>
                    </div>
                  </div>

                  {/* Share button */}
                  <ShareButton
                    miniappUrl={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                    copyLinkText={`cbwallet://miniapp?url=${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                    buttonClassName="shrink-1 w-min cursor-pointer"
                    buttonSize="lg"
                  />
                </div>

                <WebAppAboutSection
                  label="About"
                  text={brand.data?.description || ""}
                  coverUrl={brand.data?.coverUrl || ""}
                  youtubeUrl={
                    brand.data?.youtubeChannelId
                      ? `https://www.youtube.com/channel/${brand.data?.youtubeChannelId}`
                      : undefined
                  }
                  websiteUrl={brand.data?.websiteUrl || ""}
                  twitchUrl={brand.data?.socialMediaUrls?.twitch || ""}
                  twitterUrl={brand.data?.socialMediaUrls?.x || ""}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Sidebar - fixed width and no scroll */}
      <div className="flex flex-col justify-center items-center min-h-screen h-screen w-[40%] pr-6 py-6">
        <NBCard className="flex flex-col justify-between items-center h-full w-full bg-white p-5">
          <AnimatePresence mode="wait">
            {isSigningIn || isLoggingOut ? (
              <motion.div
                key="signing-in-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col justify-center items-center w-full h-full gap-5">
                <Loader2 className="size-10 text-black animate-spin" />
              </motion.div>
            ) : user.data ? (
              <motion.div
                key="user-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col justify-between items-center w-full gap-5">
                <h1 className="text-2xl font-bold text-start w-full">
                  Interact with the stream
                </h1>
                {/* Logout Button on footer */}
                <LogoutButton executeLogout={handleLogout} />
              </motion.div>
            ) : connectedAddress && !wasNotConnected ? (
              <motion.div
                key="user-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col justify-center items-center w-full h-full gap-5">
                <h1 className="text-2xl font-bold w-full text-center px-5">
                  Log in to start interacting with the stream
                </h1>
                <NBButton
                  onClick={() => signInWithWebApp()}
                  className="bg-accent w-fit">
                  <p className="text-base font-extrabold text-white">
                    Sign message
                  </p>
                </NBButton>
              </motion.div>
            ) : (
              <motion.div
                key="user-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col justify-center items-center w-full h-full gap-5">
                <h1 className="text-2xl font-bold w-full text-center px-5">
                  Connect your wallet to start interacting with the stream
                </h1>
                <NBButton
                  onClick={() => open({ view: "Connect", namespace: "eip155" })}
                  className="bg-accent w-fit">
                  <p className="text-base font-extrabold text-white">
                    Connect Wallet
                  </p>
                </NBButton>
              </motion.div>
            )}
          </AnimatePresence>
        </NBCard>
      </div>
    </motion.div>
  );
};
