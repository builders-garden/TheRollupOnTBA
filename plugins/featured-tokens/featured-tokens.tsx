import sdk from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { NBButton } from "@/components/custom-ui/nb-button";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import {
  BASE_USDC_ADDRESS,
  BASE_USDC_LOGO_URL,
  NATIVE_TOKEN_ADDRESS,
} from "@/lib/constants";
import { FeaturedToken } from "@/lib/database/db.schema";
import { PopupPositions } from "@/lib/enums";
import { User } from "@/lib/types/user.type";
import { formatWalletAddress } from "@/lib/utils";
import { formatSingleToken } from "@/lib/utils/farcaster-tokens";

interface FeaturedTokensProps {
  tokens: FeaturedToken[];
  user?: User;
}

export const FeaturedTokens = ({ tokens, user }: FeaturedTokensProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tokenTraded } = useSocketUtils();
  const { address } = useAccount();

  // Get the first wallet address with a base name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Handle token swap
  const handleSwapToken = async (token: FeaturedToken) => {
    try {
      setIsProcessing(true);

      // token details
      const tokenName = token.symbol || token.name || "";
      const tokenAddress = token.address || NATIVE_TOKEN_ADDRESS;
      const tokenChainId = token.chainId || 8453;
      const tokenImageUrl = token.logoUrl || "";
      const tokenDecimals = token.decimals || 18;

      // Placeholder token addresses - replace with actual token addresses
      const sellToken = formatSingleToken(BASE_USDC_ADDRESS); // USDC on Base
      const buyToken = formatSingleToken(tokenAddress, tokenChainId); // Placeholder token address
      const result = await sdk.actions.swapToken({
        sellToken,
        buyToken,
      });

      if (result.success) {
        // Send socket message to the server
        tokenTraded({
          position: PopupPositions.TOP_CENTER,
          username: baseName || formatWalletAddress(address),
          profilePicture: user?.avatarUrl || "",
          tokenInAmount: "",
          tokenInName: "USDC",
          tokenInDecimals: 6,
          tokenInImageUrl: BASE_USDC_LOGO_URL,
          tokenOutAmount: "",
          tokenOutDecimals: tokenDecimals,
          tokenOutName: tokenName,
          tokenOutImageUrl: tokenImageUrl,
        });
        toast.success("Token swapped successfully");
      }
    } catch (error) {
      console.error(
        `Token swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">Featured Tokens</h1>
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tokens.map((token, index) => (
          <NBButton
            key={index}
            className="w-full py-2.5"
            onClick={() => handleSwapToken(token)}
            disabled={isProcessing}>
            <div className="flex justify-center items-center w-full gap-1.5">
              {token.logoUrl ? (
                <Image
                  src={token.logoUrl}
                  alt={token.name + index.toString()}
                  width={22}
                  height={22}
                />
              ) : (
                <div className="size-4 rounded-full border border-black" />
              )}
              <p className="text-base font-extrabold text-nowrap">
                Buy ${token.symbol || token.name || ""}
              </p>
            </div>
          </NBButton>
        ))}
      </div>
    </div>
  );
};
