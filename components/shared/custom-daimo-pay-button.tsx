"use client";

import { DaimoPayButton, useDaimoPayUI } from "@daimo/pay";
import {
  PaymentBouncedEvent,
  PaymentCompletedEvent,
  PaymentStartedEvent,
} from "@daimo/pay-common";
import { DollarSignIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { base } from "viem/chains";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/auth-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { BASE_USDC_ADDRESS, DESTINATION_ADDRESS } from "@/lib/constants";
import { formatUSDAmount } from "@/lib/lifi/utils";
import { cn, formatNumberWithSuffix } from "@/lib/utils";
import { triggerHaptics } from "@/lib/utils/farcaster";
import { env } from "@/lib/zod";

interface CustomDaimoPayButtonProps {
  onSuccess: (txHash: string) => void;
}

export const CustomDaimoPayButton = ({
  onSuccess,
}: CustomDaimoPayButtonProps) => {
  const { context, capabilities } = useFarcaster();
  const [amountUSDC, setAmountUSDC] = useState<number>(1);
  const [showCustomAmountInput, setShowCustomAmountInput] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const setPaymentCompleted = useState(false)[1];
  const setPaymentHandled = useState(false)[1];
  const setErrorMessage = useState("")[1];

  const { tokenBalances } = useWalletBalance();

  const { user } = useAuth();

  const { address } = useAccount();
  const { resetPayment } = useDaimoPayUI();

  const handlePaymentStarted = useCallback((event: PaymentStartedEvent) => {
    console.log("Payment started", event);
    setPaymentHandled(false);
    setPaymentStarted(true);
    toast.info("Processing your payment...");
  }, []);

  const handlePaymentCompleted = useCallback(
    (event: PaymentCompletedEvent) => {
      if (address && event.txHash) {
        setPaymentStarted(false);
        setPaymentCompleted(true);
        setErrorMessage("");
        setPaymentHandled(true);
        toast.success("Payment completed!");
        onSuccess?.(event.txHash);
        setAmountUSDC(1); // Reset amount
      }
    },
    [onSuccess, address],
  );

  const handlePaymentBounced = useCallback((event: PaymentBouncedEvent) => {
    console.error("Payment bounced", event);
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setErrorMessage(
      "There was an error processing your payment. You received back your amount in $USDC on your wallet address. Try again.",
    );
    setPaymentHandled(true);
  }, []);

  const handleAmountChange = (newAmount: number) => {
    setAmountUSDC(newAmount);
    resetPayment({
      toUnits: newAmount.toString(),
      toCallData: undefined, //address ? createCalldata(address, amount.toString()) : undefined,
    });
    // Reset payment state when changing amount
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setPaymentHandled(false);
    setErrorMessage("");

    triggerHaptics(
      context,
      capabilities,
      "haptics.selectionChanged",
      "selection",
    );
  };

  return (
    <>
      {/* Amount Section */}
      <div className="flex flex-col gap-2">
        <div className="w-full flex items-center justify-end gap-1">
          <span className="flex flex-row items-center gap-1 text-muted-foreground text-sm">
            You have{" "}
            <span className="font-mono">
              {formatNumberWithSuffix(tokenBalances?.totalBalanceUSD ?? 0)}
            </span>{" "}
            USD
          </span>
          <DollarSignIcon className="size-4" />
        </div>
        <h3 className="text-sm xs:text-base font-semibold">Amount</h3>
        <div className={"flex flex-col gap-2"}>
          <div className="grid grid-cols-4 gap-2">
            {[0.1, 1, 2].map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountChange(amount)}
                className={cn(
                  "text-center flex items-center justify-center py-2 px-2 h-[42px] border transition-colors rounded cursor-pointer text-sm",
                  amountUSDC === amount
                    ? "border-2 border-primary text-black"
                    : "bg-transparent border-input text-muted-foreground hover:text-black hover:bg-primary/10",
                )}>
                ${amount < 1 ? amount.toFixed(2) : amount}
              </button>
            ))}
            <button
              onClick={() => {
                setShowCustomAmountInput(true);
                triggerHaptics(
                  context,
                  capabilities,
                  "haptics.selectionChanged",
                  "selection",
                );
              }}
              className={cn(
                "py-2 px-2 h-[42px] border transition-colors text-sm",
                amountUSDC === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-input text-muted-foreground hover:text-white",
              )}>
              Custom
            </button>
          </div>
          {showCustomAmountInput ? (
            <div className="flex flex-col gap-2">
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. $0.01"
                value={amountUSDC}
                onChange={(e) => {
                  const value = Math.max(0, Number(e.target.value)); // Ensure non-negative
                  handleAmountChange(value);
                }}
              />
            </div>
          ) : null}
        </div>
        {user && address ? (
          <DaimoPayButton.Custom
            appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
            metadata={{
              application: "starter",
              type: "pay",
              userId: `${user.id}`,
            }}
            preferredChains={[base.id]}
            preferredTokens={[{ chain: base.id, address: BASE_USDC_ADDRESS }]}
            toAddress={DESTINATION_ADDRESS}
            toUnits={amountUSDC.toString()}
            toToken={BASE_USDC_ADDRESS}
            toChain={base.id}
            toCallData={undefined} // createCalldata(address, amountUSDC.toString())
            connectedWalletOnly={true}
            onPaymentStarted={handlePaymentStarted}
            onPaymentCompleted={handlePaymentCompleted}
            onPaymentBounced={handlePaymentBounced}
            closeOnSuccess>
            {({ show }) => {
              return (
                <button onClick={show} disabled={false} className="w-full">
                  {paymentStarted
                    ? "Processing..."
                    : `Pay ${formatUSDAmount(Number(amountUSDC))}`}
                </button>
              );
            }}
          </DaimoPayButton.Custom>
        ) : null}
      </div>
    </>
  );
};
