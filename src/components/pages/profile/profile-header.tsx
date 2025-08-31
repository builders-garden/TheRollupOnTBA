import { CircleUserIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { FarcasterViewProfile } from "@/components/shared/farcaster-view-profile";
import { ShareButton } from "@/components/shared/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { env } from "@/lib/env";
import { formatAvatarSrc } from "@/lib/utils";
import { createFarcasterIntentUrl } from "@/lib/utils/farcaster";
import { User } from "@/types";

interface ProfileHeaderProps {
  user: User | null;
}

const motionBaseDelay = 0.125;

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { user: currentUser } = useAuth();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShareProfile = () => {
    if (!user) return;
    createFarcasterIntentUrl(
      `Check out my profile @${user.farcasterUsername}`,
      `${env.NEXT_PUBLIC_URL}/profile/${user.id}`,
    );
  };

  return (
    <div className="flex flex-col w-full gap-4 py-2">
      <div className="flex justify-start items-center w-full">
        {/* Profile picture and name */}
        <div className="flex items-center gap-1 w-full">
          {/* Profile picture */}
          {!user ? (
            <Skeleton className="w-[86px] h-[86px] rounded-full bg-[#323232]" />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: motionBaseDelay }}
              className="relative">
              <div className="w-[86px] h-[86px] rounded-full flex items-center justify-center">
                {user.farcasterAvatarUrl ? (
                  <Image
                    src={formatAvatarSrc(user.farcasterAvatarUrl)}
                    alt="Profile Picture"
                    className="object-cover rounded-full w-[76px] h-[76px]"
                    width={76}
                    height={76}
                  />
                ) : (
                  <CircleUserIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </motion.div>
          )}

          {/* Username and joined date */}
          {!user ? (
            <div className="flex flex-col gap-1 w-full">
              <Skeleton className="w-[150px] h-[28px] rounded-lg bg-[#323232]" />
              <Skeleton className="w-[120px] h-[18px] rounded-lg bg-[#323232]" />
            </div>
          ) : (
            <div className="flex gap-1 w-full justify-between">
              <div className="flex flex-col gap-1 w-full">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: motionBaseDelay * 2,
                  }}
                  className="text-2xl font-semibold items-center justify-between flex gap-2">
                  <FarcasterViewProfile
                    farcasterFid={user.farcasterFid?.toString() ?? ""}
                    farcasterUsername={user.farcasterUsername ?? ""}
                    text={
                      user
                        ? user.farcasterUsername
                          ? user.farcasterUsername.length > 14
                            ? `${user.farcasterUsername?.slice(0, 10)}...`
                            : `${user.farcasterUsername}`
                          : "unknown"
                        : "unknown"
                    }
                  />
                </motion.h1>
                <span className="text-sm text-muted-foreground">
                  Joined{" "}
                  {new Date(user?.createdAt ?? "").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {currentUser && currentUser.id === user.id ? (
                <div className="flex items-center justify-end">
                  <ShareButton
                    side="left"
                    buttonSize="icon"
                    navigatorTitle={`Starter profile`}
                    navigatorText={`Check out my profile: @${user.farcasterUsername}`}
                    miniappUrl={`${env.NEXT_PUBLIC_URL}/profile/${user.id}`}
                    linkCopied={linkCopied}
                    setLinkCopied={setLinkCopied}
                    handleShare={handleShareProfile}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
