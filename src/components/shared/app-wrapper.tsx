// hooks
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { basePreconf } from "viem/chains";
import { injected, useAccount, useConnect, useSwitchChain } from "wagmi";
// modals
import { HelpModal } from "@/components/modals/help";
import { LoadingProfileModal } from "@/components/modals/loading-profile";
// pages
import { HomePage } from "@/components/pages/home";
import { ProfilePage } from "@/components/pages/profile";
import { Navbar } from "@/components/shared/navbar";
// hooks
import { useApp } from "@/contexts/app-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import { useGetUser } from "@/hooks/use-get-user";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
// other
import { OverlayContent, PageContent } from "@/types";

export default function AppWrapper() {
  const { isConnected, address, chainId } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { switchChain } = useSwitchChain();
  const { context, isMiniAppReady, safeAreaInsets } = useFarcaster();
  const { ethBalance, tokenBalances, isLoadingTokenBalances } =
    useWalletBalance();

  const {
    activeUserId,
    pageContent,
    overlayContent,
    handlePageChange,
    handleModalChange,
    setActiveProfile,
  } = useApp();

  const {
    data: modalUser,
    isPending: isPendingModalUser,
    isLoading: isLoadingModalUser,
    isSuccess: isSuccessModalUser,
    error: errorModalUser,
  } = useGetUser({
    userId: activeUserId,
    enabled: overlayContent === OverlayContent.VIEW_PROFILE && !!activeUserId,
  });

  useEffect(() => {
    if (connectError) {
      console.error("wagmi connection error", connectError);
    }
  }, [connectError]);

  // always connect to wagmi farcaster miniapp to retrieve wallet address
  useEffect(() => {
    if (!isConnected || !address) {
      if (context && isMiniAppReady) {
        connect({ connector: miniAppConnector() });
      } else if (!context && isMiniAppReady) {
        connect({ connector: injected() });
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  // connect to base
  useEffect(() => {
    if (isConnected && !!chainId && chainId !== basePreconf.id) {
      switchChain({ chainId: basePreconf.id });
    }
  }, [isConnected, chainId, switchChain]);

  useEffect(() => {
    if (
      overlayContent === OverlayContent.VIEW_PROFILE &&
      modalUser &&
      isSuccessModalUser &&
      modalUser.user
    ) {
      setActiveProfile(modalUser.user);
      handlePageChange(PageContent.PROFILE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalUser]);

  return (
    <div className="relative z-10">
      <div
        style={{
          backgroundColor: "#FCF5EC",
          backgroundSize: "160px 160px",
          backgroundPosition: "0 0, 0 80px, 80px -80px, -80px 0px",
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        className="flex flex-col h-screen size-full max-w-md mx-auto overflow-x-hidden gap-2 no-scrollbar">
        <Navbar />

        <div className="flex-1 relative">
          <div className="flex flex-col w-full h-full">
            <AnimatePresence mode="wait">
              <div className="">
                {pageContent === PageContent.HOME ? (
                  <HomePage key="home" />
                ) : pageContent === PageContent.PROFILE ? (
                  <ProfilePage key="profile" />
                ) : null}
              </div>
            </AnimatePresence>
          </div>
        </div>

        {overlayContent === OverlayContent.HELP ? (
          <HelpModal onClose={() => handleModalChange(OverlayContent.NONE)} />
        ) : overlayContent === OverlayContent.VIEW_PROFILE &&
          isLoadingModalUser ? (
          <LoadingProfileModal
            onClose={() => handleModalChange(OverlayContent.NONE)}
          />
        ) : null}
      </div>
    </div>
  );
}
