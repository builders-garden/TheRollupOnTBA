"use client";

// components
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
// hooks
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { useFarcaster } from "@/contexts/farcaster-context";
// other
import { formatAvatarSrc, formatWalletAddress } from "@/lib/utils";
import { PageContent } from "@/types";
import { ConnectWalletButton } from "./connect-wallet";

export const UserProfile = () => {
  const { context, isInMiniApp } = useFarcaster();
  const { setActiveProfile, handlePageChange } = useApp();
  const { user, isSignedIn } = useAuth();

  const pfpUrl =
    isInMiniApp && context && context.user.pfpUrl
      ? formatAvatarSrc(context.user.pfpUrl)
      : user && user.avatarUrl
        ? formatAvatarSrc(user.avatarUrl)
        : null;

  const handleOpenProfile = () => {
    if (user) {
      setActiveProfile(user);
      handlePageChange(PageContent.PROFILE);
    }
  };
  return (
    <div className="flex flex-row gap-2 items-center tracking-tight">
      {isInMiniApp || isSignedIn ? (
        <div onClick={handleOpenProfile} className="cursor-pointer">
          {pfpUrl ? (
            <UserAvatar avatarUrl={pfpUrl} size="sm" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {formatWalletAddress(user?.wallets[0].address || "")}
            </p>
          )}
        </div>
      ) : (
        <ConnectWalletButton
          onConnected={() => {
            console.log("connected");
          }}
        />
      )}
    </div>
  );
};
