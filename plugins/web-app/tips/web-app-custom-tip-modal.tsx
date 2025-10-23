import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { CTSModal } from "@/components/custom-ui/cts-modal";
import { useAiTextCensor } from "@/hooks/use-ai-text-censor";
import { censorTextLocally } from "@/lib/ai-censor";
import {
  MAX_TIP_CUSTOM_MESSAGE_LENGTH,
  MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE,
} from "@/lib/constants";
import { AuthTokenType } from "@/lib/enums";
import { cn } from "@/lib/utils";

interface WebAppCustomTipModalProps {
  customTipButton: {
    color?: "blue" | "black";
    text?: string;
    textClassName?: string;
    buttonClassName?: string;
  };
  isProcessing: boolean;
  isTransferLoading: boolean;
  handleTipPayment: (amount: number, customText?: string) => Promise<void>;
  connectedAddress?: string;
}

export const WebAppCustomTipModal = ({
  customTipButton,
  isProcessing,
  isTransferLoading,
  handleTipPayment,
  connectedAddress,
}: WebAppCustomTipModalProps) => {
  const [isCustomTipModalOpen, setIsCustomTipModalOpen] = useState(false);

  const [isEditingCustomText, setIsEditingCustomText] = useState(false);
  const [customText, setCustomText] = useState<string>("");

  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");

  const { mutate: censorTextWithAI } = useAiTextCensor(
    AuthTokenType.WEB_APP_AUTH_TOKEN,
  );

  // Whether the custom amount is over the minimum amount for a custom message
  const isAmountOverTheMinimum =
    parseFloat(customAmount) >= MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE;

  // If the amount goes below the minimum amount for a custom message, set the custom text to empty
  useEffect(() => {
    if (!isAmountOverTheMinimum) {
      setTimeout(() => {
        setCustomText("");
      }, 300);
    }
  }, [isAmountOverTheMinimum]);

  // Handles Custom Tip Modal Open
  const handleCustomTipModalOpen = () => {
    setIsCustomTipModalOpen(!isCustomTipModalOpen);
    setTimeout(() => {
      setIsEditingAmount(false);
      setIsEditingCustomText(false);
      setCustomAmount("");
      setCustomText("");
    }, 300);
  };

  // Handle custom tip payment
  const handleCustomTipPayment = async () => {
    if (!connectedAddress) {
      toast.info("Please connect your wallet to tip");
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid custom amount");
      return;
    }

    // Filter custom text from slurs and other bad words
    censorTextWithAI(
      { text: customText },
      {
        onSuccess: async (data) => {
          const censoredText = data.censoredText;
          await handleTipPayment(amount, censoredText);
          handleCustomTipModalOpen();
        },
        onError: async () => {
          const censoredText = censorTextLocally(customText);
          await handleTipPayment(amount, censoredText);
          handleCustomTipModalOpen();
        },
      },
    );
  };

  return (
    <CTSModal
      trigger={
        <CTSButton
          disabled={isProcessing || isTransferLoading}
          className={cn("w-full", customTipButton.buttonClassName)}>
          <p
            className={cn(
              "text-lg font-extrabold",
              customTipButton.textClassName,
            )}>
            {customTipButton.text}
          </p>
        </CTSButton>
      }
      isOpen={isCustomTipModalOpen}
      setIsOpen={handleCustomTipModalOpen}
      contentClassName="p-4 sm:p-6 rounded-[12px] sm:max-w-2xl">
      <div className="flex flex-col justify-center items-center w-full gap-1">
        <h1 className="text-2xl font-bold text-center">Choose custom tip</h1>
        <p className="text-sm text-muted-foreground text-center">
          You can add a custom message by tipping{" "}
          {MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE}$ or more
        </p>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-2.5 my-2.5">
        {/* Amount */}
        <div
          className={cn(
            "flex justify-center items-center w-full gap-1 rounded-[12px] pl-2 border-accent border-[1px] ring-accent/40 transition-all duration-300",
            isEditingAmount && "ring-[2px]",
          )}>
          <p>$</p>
          <input
            placeholder="0.01"
            className="w-full h-[42px] focus-visible:ring-none focus-visible:border-none rounded-[12px] transition-all duration-300 outline-none focus:ring-none focus:ring-0 focus:border-none"
            type="number"
            min={0}
            value={customAmount}
            onFocus={() => setIsEditingAmount(true)}
            onBlur={() => setIsEditingAmount(false)}
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

        {/* Custom Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key="custom-text-input"
            initial={{ opacity: 0, height: 0, marginBottom: "-10px" }}
            animate={{
              opacity: isAmountOverTheMinimum ? 1 : 0,
              height: isAmountOverTheMinimum ? "44px" : 0,
              marginBottom: isAmountOverTheMinimum ? 0 : "-10px",
              transition: {
                height: {
                  delay: isAmountOverTheMinimum ? 0 : 0.25,
                },
                opacity: {
                  delay: isAmountOverTheMinimum ? 0.25 : 0,
                },
                marginBottom: {
                  delay: isAmountOverTheMinimum ? 0 : 0.25,
                },
              },
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex justify-center items-center w-full">
            <div
              className={cn(
                "flex justify-center items-center w-full gap-1 rounded-[12px] pl-2 border-accent border-[1px] ring-accent/40 transition-all duration-300",
                isEditingCustomText && "ring-[2px]",
              )}>
              <input
                placeholder="Your custom message..."
                className="w-full h-[42px] focus-visible:ring-none focus-visible:border-none rounded-[12px] transition-all duration-300 outline-none focus:ring-none focus:ring-0 focus:border-none"
                type="text"
                disabled={!customAmount || !isAmountOverTheMinimum}
                min={0}
                value={customText}
                onFocus={() => setIsEditingCustomText(true)}
                onBlur={() => setIsEditingCustomText(false)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_TIP_CUSTOM_MESSAGE_LENGTH) {
                    setCustomText(value);
                  } else {
                    setCustomText(
                      value.slice(0, MAX_TIP_CUSTOM_MESSAGE_LENGTH),
                    );
                  }
                }}
              />

              <p className="text-sm text-muted-foreground ml-3 mr-2">
                {customText.length}/{MAX_TIP_CUSTOM_MESSAGE_LENGTH}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-5">
        <CTSButton
          key="confirm"
          className="w-full bg-accent"
          onClick={handleCustomTipPayment}
          disabled={
            isProcessing ||
            isTransferLoading ||
            !customAmount ||
            parseFloat(customAmount) <= 0
          }>
          <p className="text-base font-extrabold text-foreground">
            {isProcessing || isTransferLoading ? "Processing..." : "Confirm"}
          </p>
        </CTSButton>

        <button
          className="text-base font-bold text-black cursor-pointer"
          onClick={handleCustomTipModalOpen}>
          Cancel
        </button>
      </div>
    </CTSModal>
  );
};
