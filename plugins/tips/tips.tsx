import { getPaymentStatus, pay } from "@base-org/account";
import { sdk } from "@farcaster/miniapp-sdk";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBModal } from "@/components/custom-ui/nb-modal";
import { useConfetti } from "@/hooks/use-confetti";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useCreateTip } from "@/hooks/use-tips";
import { useUsdcTransfer } from "@/hooks/use-usdc-transfer";
import { FARCASTER_CLIENT_FID } from "@/lib/constants";
import { TipSettings } from "@/lib/database/db.schema";
import { PopupPositions } from "@/lib/enums";
import { User } from "@/lib/types/user.type";
import { cn, formatWalletAddress } from "@/lib/utils";

interface TipsProps {
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
}

export const Tips = ({
  label = "Tip",
  showLabel = true,
  tipSettings,
  tips,
  customTipButton,
  user,
}: TipsProps) => {
  const [isCustomTipModalOpen, setIsCustomTipModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { tipSent } = useSocketUtils();
  const { address } = useAccount();
  const { startConfetti } = useConfetti({});
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: createTip } = useCreateTip();

  // Get the first wallet address with a base name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Use your hook with fixed parameters
  const {
    transfer: transferUsdc,
    isLoading: isTransferLoading,
    isSuccess: isTransferSuccess,
    hasError: isTransferError,
    error: transferError,
  } = useUsdcTransfer({
    amount: "1", // Default value
    receiver: tipSettings.payoutAddress || "",
  });

  // Handles Custom Tip Modal Open
  const handleCustomTipModalOpen = () => {
    setIsCustomTipModalOpen(!isCustomTipModalOpen);
    setCustomAmount("");
  };

  // Handle tip payment
  const handleTipPayment = async (amount: number) => {
    if (!tipSettings.payoutAddress || !user?.id) {
      return;
    }

    try {
      setIsProcessing(true);

      if (
        (await sdk.context).client.clientFid === FARCASTER_CLIENT_FID.farcaster
      ) {
        try {
          // Execute the transfer using your hook with dynamic parameters
          await transferUsdc(amount.toString(), tipSettings.payoutAddress);

          if (isTransferSuccess) {
            tipSent({
              position: PopupPositions.TOP_CENTER,
              username:
                baseName || user?.username || formatWalletAddress(address),
              profilePicture: user?.avatarUrl || "",
              tipAmount: amount.toString(),
            });
            toast.success("Tip sent successfully");
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
            });
          } else if (isTransferError) {
            console.log("Farcaster USDC transfer failed:", transferError);
            throw transferError;
          }
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
          position: PopupPositions.TOP_CENTER,
          username: baseName || user?.username || formatWalletAddress(address),
          profilePicture: user?.avatarUrl || "",
          tipAmount: amount.toString(),
        });
        toast.success("Tip sent successfully");
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
        });
      } else {
        console.log("Base payment status:", status);
      }
    } catch (error) {
      console.log(
        `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      // You can add error notification here
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle custom tip payment
  const handleCustomTipPayment = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid custom amount");
      return;
    }

    await handleTipPayment(amount);
    setIsCustomTipModalOpen(false);
    setCustomAmount("");
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      {showLabel && <h1 className="text-sm font-bold">{label}</h1>}
      <div className="grid grid-cols-4 w-full gap-2.5">
        {tips.map((tip) => (
          <NBButton
            key={tip.amount}
            buttonColor={tip.buttonColor}
            onClick={() => handleTipPayment(tip.amount)}
            disabled={isProcessing || isTransferLoading}
            className={cn("w-full", tip.buttonClassName)}>
            <p className={cn("text-base font-extrabold", tip.textClassName)}>
              ${tip.amount}
            </p>
          </NBButton>
        ))}

        {!!customTipButton && (
          <NBModal
            trigger={
              <NBButton
                buttonColor={customTipButton.color}
                disabled={isProcessing || isTransferLoading}
                className={cn("w-full", customTipButton.buttonClassName)}>
                <p
                  className={cn(
                    "text-base font-extrabold",
                    customTipButton.textClassName,
                  )}>
                  {customTipButton.text}
                </p>
              </NBButton>
            }
            isOpen={isCustomTipModalOpen}
            setIsOpen={handleCustomTipModalOpen}
            contentClassName="p-2.5 rounded-[12px]">
            <h1 className="text-2xl font-bold text-center">
              Choose custom tip
            </h1>
            <div
              className={cn(
                "flex justify-center items-center w-full gap-1 rounded-[12px] pl-2 border-accent border-[1px] ring-accent/40 transition-all duration-300",
                isEditing && "ring-[2px]",
              )}>
              <p>$</p>
              <input
                placeholder="0.01"
                className="w-full h-[42px] focus-visible:ring-none focus-visible:border-none rounded-[12px] transition-all duration-300 outline-none focus:ring-none focus:ring-0 focus:border-none"
                type="number"
                min={0}
                value={customAmount}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid numbers >= 0
                  if (
                    value === "" ||
                    (!isNaN(Number(value)) && Number(value) >= 0)
                  ) {
                    setCustomAmount(value);
                  } else {
                    setCustomAmount("");
                  }
                }}
              />
            </div>

            <div className="flex flex-col justify-center items-center w-full gap-5">
              <NBButton
                key="confirm"
                className="w-full bg-accent"
                onClick={handleCustomTipPayment}
                disabled={
                  isProcessing ||
                  isTransferLoading ||
                  !customAmount ||
                  parseFloat(customAmount) <= 0
                }>
                <p className="text-base font-extrabold text-white">
                  {isProcessing || isTransferLoading
                    ? "Processing..."
                    : "Confirm"}
                </p>
              </NBButton>

              <button
                className="text-base font-bold text-black"
                onClick={handleCustomTipModalOpen}>
                Cancel
              </button>
            </div>
          </NBModal>
        )}
      </div>
    </div>
  );
};
