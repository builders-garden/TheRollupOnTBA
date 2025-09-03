import { useState } from "react";
import { Input } from "@/components/shadcn-ui/input";
import { NBModal } from "@/components/shared/mini-app/nb-modal";
import { NBButton } from "@/components/shared/nb-button";
import { cn } from "@/lib/utils";

interface TipsProps {
  label?: string;
  showLabel?: boolean;
  className?: string;
  tips: {
    amount: number;
    onClick: () => void;
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

  // Handles Custom Tip Modal Open
  const handleCustomTipModalOpen = () => {
    setIsCustomTipModalOpen(!isCustomTipModalOpen);
    setCustomAmount("");
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      {showLabel && <h1 className="text-[14px] font-bold">{label}</h1>}
      <div className="grid grid-cols-4 w-full gap-2.5">
        {tips.map((tip) => (
          <NBButton
            key={tip.amount}
            buttonColor={tip.buttonColor}
            onClick={tip.onClick}
            className={cn("w-full", tip.buttonClassName)}>
            <p className={cn("text-[16px] font-extrabold", tip.textClassName)}>
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
                    "text-[16px] font-extrabold",
                    customTipButton.textClassName,
                  )}>
                  {customTipButton.text}
                </p>
              </NBButton>
            }
            isOpen={isCustomTipModalOpen}
            setIsOpen={handleCustomTipModalOpen}
            contentClassName="p-2.5 rounded-[12px]">
            <h1 className="text-[24px] font-bold text-center">
              Choose custom tip
            </h1>
            <div className="flex flex-col justify-center items-center w-full gap-2.5">
              <Input
                placeholder="e.g. $0.01"
                className="w-full h-[42px] border-accent focus-visible:ring-accent/40 focus-visible:ring-[2px] focus-visible:border-accent rounded-[12px]"
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
              <NBButton key="confirm" className="w-full bg-accent">
                <p className="text-[16px] font-extrabold text-white">Confirm</p>
              </NBButton>

              <button
                className="text-[16px] font-bold text-black"
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
