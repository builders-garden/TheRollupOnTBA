"use client";

import Image from "next/image";
import { useAccount } from "wagmi";
import { CustomDaimoPayButton } from "@/components/shared/custom-daimo-pay-button";
import { useAuth } from "@/contexts/auth-context";
import { formatAvatarSrc, formatWalletAddress } from "@/lib/utils";

export function HomePage() {
  const { user } = useAuth();
  const { address } = useAccount();

  return (
    <div className="text-black flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Starter</h1>
        <p className="text-lg text-muted-foreground">
          {address
            ? formatWalletAddress(address)
            : "Connect wallet to get started"}
        </p>
        <div className="space-y-4">
          {user ? (
            <div className="flex flex-col items-center space-y-2 min-h-[160px] justify-center">
              {user.avatarUrl ? (
                <Image
                  src={formatAvatarSrc(user.avatarUrl)}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                  width={80}
                  height={80}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted" />
              )}
              <div className="text-center">
                {user.farcasterDisplayName ? (
                  <p className="font-semibold">{user.farcasterDisplayName}</p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  {user.username
                    ? `@${user.username}`
                    : formatWalletAddress(user.wallets[0].address)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <CustomDaimoPayButton onSuccess={() => {}} />
      </div>
    </div>
  );
}
