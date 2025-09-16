import sdk from "@farcaster/miniapp-sdk";
import { ArrowDownUp, ChartColumn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import { NBButton } from "@/components/custom-ui/nb-button";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import {
  BASE_USDC_ADDRESS,
  BASE_USDC_LOGO_URL,
  FARCASTER_CLIENT_FID,
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
      // await 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (result.success && result.swap.transactions) {
        if (
          (await sdk.context).client.clientFid ===
          FARCASTER_CLIENT_FID.farcaster
        ) {
          if (result.swap.transactions.length > 0) {
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
          }
        } else {
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
        }
      }
    } catch (error) {
      console.error(
        `Token swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle token show chart
  const handleShowChart = async (token: FeaturedToken) => {
    try {
      // token details
      const tokenAddress = token.address || NATIVE_TOKEN_ADDRESS;
      const tokenChainId = token.chainId || 8453;

      // Placeholder token addresses - replace with actual token addresses
      const tokenToView = formatSingleToken(tokenAddress, tokenChainId); // Placeholder token address
      await sdk.actions.viewToken({
        token: tokenToView,
      });
    } catch (error) {
      console.error(
        `Token swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">Featured Tokens</h1>
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tokens.map((token, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full py-2.5 px-2.5 rounded-[8px] border-[1px] border-black">
            <div className="flex justify-start items-center w-full max-w-[50%] gap-[3px]">
              <Image
                src={token.logoUrl || "/images/coin.svg"}
                alt={token.name + index.toString()}
                width={16}
                height={16}
              />
              <p className="text-xs font-extrabold break-words">
                ${token.symbol || token.name || ""}
              </p>
            </div>
            <div className="flex justify-end items-center w-full gap-2">
              <NBButton
                onClick={() => handleSwapToken(token)}
                className="bg-accent size-[24px] p-0 rounded-[4px]"
                disabled={isProcessing}>
                <ArrowDownUp
                  className="size-4 shrink-0 text-white"
                  strokeWidth={1.5}
                />
              </NBButton>
              <NBButton
                onClick={() => handleShowChart(token)}
                className="size-[24px] p-0 rounded-[4px]"
                disabled={isProcessing}>
                <ChartColumn className="size-4 shrink-0" strokeWidth={1.5} />
              </NBButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
