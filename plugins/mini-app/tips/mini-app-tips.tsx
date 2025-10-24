import { getPaymentStatus, pay } from "@base-org/account";
import { sdk } from "@farcaster/miniapp-sdk";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useCreateTip } from "@/hooks/use-tips";
import { useUsdcTransfer } from "@/hooks/use-usdc-transfer";
import {
  FARCASTER_CLIENT_FID,
  MAX_TIP_CUSTOM_MESSAGE_LENGTH,
  MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE,
  THE_ROLLUP_BRAND_SLUG,
} from "@/lib/constants";
import { TipSettings } from "@/lib/database/db.schema";
import { AuthTokenType, PopupPositions } from "@/lib/enums";
import { wagmiConfigMiniApp } from "@/lib/reown";
import { User } from "@/lib/types/user.type";
import { cn, formatWalletAddress } from "@/lib/utils";
import { createFarcasterIntentUrl } from "@/lib/utils/farcaster";
import { env } from "@/lib/zod";
import { MiniAppCustomTipModal } from "./mini-app-custom-tip-modal";

interface MiniAppTipsProps {
  label?: string;
  showLabel?: boolean;
  className?: string;
  tips: {
    amount: number;
    onClick?: () => void; // Made optional since we handle payment internally
    textClassName?: string;
    buttonColor?: "blue" | "black";
    buttonClassName?: string;
  }[];
  customTipButton?: {
    color?: "blue" | "black";
    text?: string;
    textClassName?: string;
    buttonClassName?: string;
  };
  tipSettings: TipSettings;
  user?: User;
  brandName?: string;
  brandSlug?: string;
}

export const MiniAppTips = ({
  label = "Tip",
  showLabel = true,
  tipSettings,
  tips,
  customTipButton,
  user,
  brandName,
  brandSlug,
}: MiniAppTipsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tipSent } = useSocketUtils();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({});
  const { mutate: createTip } = useCreateTip(AuthTokenType.MINI_APP_AUTH_TOKEN);

  // Get the first wallet address with a base name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Use your hook with fixed parameters
  const {
    transfer: transferUsdc,
    isLoading: isTransferLoading,
    error: transferError,
  } = useUsdcTransfer({
    amount: "1", // Default value
    receiver: tipSettings.payoutAddress || "",
    wagmiConfig: wagmiConfigMiniApp,
  });

  // Handle tip payment
  const handleTipPayment = async (amount: number, customText?: string) => {
    if (!tipSettings.payoutAddress || !user?.id) {
      return;
    }

    // If the custom text is over 64 characters or the amount is less than 5$, set it to empty
    let customTextToUse = customText;
    if (
      (customText?.length &&
        customText.length > MAX_TIP_CUSTOM_MESSAGE_LENGTH) ||
      amount < MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE
    ) {
      customTextToUse = "";
    }

    try {
      setIsProcessing(true);

      if (
        (await sdk.context).client.clientFid === FARCASTER_CLIENT_FID.farcaster
      ) {
        try {
          // Execute the transfer using your hook with dynamic parameters
          await transferUsdc(
            amount.toString(),
            tipSettings.payoutAddress,
            () => {
              tipSent({
                brandId: tipSettings.brandId,
                position: PopupPositions.TOP_CENTER,
                username:
                  baseName || user?.username || formatWalletAddress(address),
                profilePicture: user?.avatarUrl || "",
                tipAmount: amount.toString(),
                customMessage: customTextToUse || "",
              });
              toast.success("Tip sent successfully", {
                action: {
                  label: "Share",
                  onClick: () => {
                    createFarcasterIntentUrl(
                      `I just tipped ${amount} ${brandName ? `to ${brandName}` : "on ControlTheStream"}!`,
                      `${env.NEXT_PUBLIC_URL}${brandSlug ? `/${brandSlug}` : ""}`,
                    );
                  },
                },
                duration: 10000, // 10 seconds
              });
              startConfetti();

              // Create a tip record in the database
              createTip({
                senderId: user.id,
                receiverBrandId: tipSettings.brandId,
                receiverAddress: tipSettings.payoutAddress,
                receiverBaseName: tipSettings.payoutBaseName,
                receiverEnsName: tipSettings.payoutEnsName,
                amount: amount.toString(),
                platform: "farcaster",
                customMessage: customTextToUse,
              });
            },
            () => {
              console.log("Farcaster USDC transfer failed:", transferError);
              throw transferError;
            },
          );
        } catch (farcasterError) {
          console.log("Farcaster USDC transfer failed:", farcasterError);
          throw farcasterError; // Re-throw to be caught by outer catch
        }

        return; // Exit early for Farcaster payments
      }

      // Base payment flow for non-Farcaster environments
      const payment = await pay({
        amount: amount.toString(), // USD amount (USDC used internally)
        to: tipSettings.payoutAddress as `0x${string}`,
        testnet: false, // set false for Mainnet
      });

      // await 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Poll until mined
      const { status } = await getPaymentStatus({
        id: payment.id,
        testnet: false, // MUST match the testnet setting used in pay()
      });

      if (status === "completed") {
        console.log("🎉 Base payment settled");
        // You can add success notification here
        tipSent({
          brandId: tipSettings.brandId,
          position: PopupPositions.TOP_CENTER,
          username: baseName || user?.username || formatWalletAddress(address),
          profilePicture: user?.avatarUrl || "",
          tipAmount: amount.toString(),
          customMessage: customTextToUse || "",
        });
        toast.success("Tip sent successfully", {
          action: {
            label: (
              <div className="flex justify-center items-center gap-1.5">
                <p>Share</p>
                <ExternalLink className="size-3" />
              </div>
            ),
            onClick: () => {
              createFarcasterIntentUrl(
                `I just tipped ${amount} ${brandName ? `to ${brandName}` : "on ControlTheStream"}!`,
                `${env.NEXT_PUBLIC_URL}${brandSlug ? `/${brandSlug}` : ""}`,
              );
            },
          },
          duration: 10000, // 10 seconds
        });
        startConfetti();

        // Create a tip record in the database
        createTip({
          senderId: user?.id,
          receiverBrandId: tipSettings.brandId,
          receiverAddress: tipSettings.payoutAddress,
          receiverBaseName: tipSettings.payoutBaseName,
          receiverEnsName: tipSettings.payoutEnsName,
          amount: amount.toString(),
          platform: "base",
          customMessage: customTextToUse,
        });
      } else {
        console.log("Base payment status:", status);
      }
    } catch (error) {
      toast.error("Payment of tip failed");
      console.log(
        `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      {showLabel && <h1 className="text-sm font-bold">{label}</h1>}
      <div className="grid grid-cols-4 w-full gap-2.5">
        {tips.map((tip) => {
          return brandSlug === THE_ROLLUP_BRAND_SLUG ? (
            <TheRollupButton
              key={tip.amount}
              buttonColor={tip.buttonColor}
              onClick={() => handleTipPayment(tip.amount)}
              disabled={isProcessing || isTransferLoading}
              className={cn("w-full", tip.buttonClassName)}>
              <p className={cn("text-base font-extrabold", tip.textClassName)}>
                ${tip.amount}
              </p>
            </TheRollupButton>
          ) : (
            <CTSButton
              key={tip.amount}
              onClick={() => handleTipPayment(tip.amount)}
              disabled={isProcessing || isTransferLoading}
              className={cn(
                "w-full bg-secondary/20 border-secondary hover:bg-secondary/30 border-2",
                tip.buttonClassName,
              )}>
              <p
                className={cn(
                  "text-base font-extrabold text-foreground",
                  tip.textClassName,
                )}>
                ${tip.amount}
              </p>
            </CTSButton>
          );
        })}

        {!!customTipButton && (
          <MiniAppCustomTipModal
            customTipButton={customTipButton}
            isProcessing={isProcessing}
            isTransferLoading={isTransferLoading}
            handleTipPayment={handleTipPayment}
            brandSlug={brandSlug}
          />
        )}
      </div>
    </div>
  );
};
