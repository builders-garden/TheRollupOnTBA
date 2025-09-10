import { getPaymentStatus, pay } from "@base-org/account";
import { Context } from "@farcaster/miniapp-core";
import { sdk } from "@farcaster/miniapp-sdk";
import { useState } from "react";
import { parseUnits } from "viem";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBModal } from "@/components/custom-ui/nb-modal";
import { Input } from "@/components/shadcn-ui/input";
import { useUsdcTransfer } from "@/hooks/use-usdc-transfer";
import { FARCASTER_CLIENT_FID } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
}

export const Tips = ({
  label = "Tip",
  showLabel = true,
  tips,
  customTipButton,
}: TipsProps) => {
  const [isCustomTipModalOpen, setIsCustomTipModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Usa il tuo hook con parametri fissi
  const {
    transfer: transferUsdc,
    txHash,
    isLoading: isTransferLoading,
    isSuccess: isTransferSuccess,
    hasError: isTransferError,
    error: transferError,
  } = useUsdcTransfer({
    amount: "1", // Valore di default
    receiver: "0x4110c5B6D9fAbf629c43a7B0279b9969CB698971", // Valore di default
  });

  // Handles Custom Tip Modal Open
  const handleCustomTipModalOpen = () => {
    setIsCustomTipModalOpen(!isCustomTipModalOpen);
    setCustomAmount("");
  };

  // Handle tip payment
  const handleTipPayment = async (amount: number) => {
    try {
      setIsProcessing(true);

      console.log("amount:", amount);
      console.log("context client fid:", (await sdk.context).client.clientFid);

      if (
        (await sdk.context).client.clientFid === FARCASTER_CLIENT_FID.farcaster
      ) {
        // Farcaster payment flow - use your USDC transfer hook
        console.log("Using Farcaster USDC transfer for payment");

        try {
          // Execute the transfer using your hook with dynamic parameters
          await transferUsdc(
            amount.toString(),
            "0x4110c5B6D9fAbf629c43a7B0279b9969CB698971",
          );

          if (isTransferSuccess) {
            console.log("🎉 Farcaster USDC transfer completed successfully!");
            console.log("Transaction hash:", txHash);
            // You can add success notification here
          } else if (isTransferError) {
            console.error("Farcaster USDC transfer failed:", transferError);
            throw transferError;
          }
        } catch (farcasterError) {
          console.error("Farcaster USDC transfer failed:", farcasterError);
          throw farcasterError; // Re-throw to be caught by outer catch
        }

        return; // Exit early for Farcaster payments
      }

      // Base payment flow for non-Farcaster environments
      console.log("Using Base payment SDK");

      const payment = await pay({
        amount: amount.toFixed(2), // USD amount (USDC used internally)
        to: "0x4110c5B6D9fAbf629c43a7B0279b9969CB698971", // TODO: change to the recipient address
        testnet: false, // set false for Mainnet
      });

      console.log("payment:", payment);

      // Poll until mined
      const { status } = await getPaymentStatus({
        id: payment.id,
        testnet: false, // MUST match the testnet setting used in pay()
      });

      if (status === "completed") {
        console.log("🎉 Base payment settled");
        // You can add success notification here
      } else {
        console.log("Base payment status:", status);
      }
    } catch (error) {
      console.error(
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
                onClick={() => {}}
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
            <div className="flex flex-col justify-center items-center w-full gap-2.5">
              <Input
                placeholder="e.g. $0.01"
                className="w-full h-[42px] border-accent focus-visible:ring-accent/40 focus-visible:ring-[2px] focus-visible:border-accent rounded-[12px] transition-all duration-300"
                type="number"
                min={0}
                value={customAmount}
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
