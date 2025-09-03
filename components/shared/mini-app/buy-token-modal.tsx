import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../../shadcn-ui/input";
import { NBButton } from "./nb-button";
import { NBModal } from "./nb-modal";

interface BuyTokenModalProps {
  trigger: React.ReactNode;
  tokenName: string;
}

type SelectableAmount = "1" | "3" | "5" | "10" | "custom";

export const BuyTokenModal = ({ trigger, tokenName }: BuyTokenModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountSelected, setAmountSelected] = useState<
    SelectableAmount | undefined
  >(undefined);
  const [customAmount, setCustomAmount] = useState<string>("");

  // Handles Modal Open
  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
    // This prevents the values to reset before the modal closing animation is complete
    setTimeout(() => {
      setAmountSelected(undefined);
      setCustomAmount("");
    }, 300);
  };

  const selectableAmounts: SelectableAmount[] = ["1", "3", "5", "10"];

  return (
    <NBModal
      trigger={trigger}
      isOpen={isModalOpen}
      setIsOpen={handleModalOpen}
      contentClassName="p-2.5 rounded-[12px]">
      <h1 className="text-[24px] font-bold text-center">Buy ${tokenName}</h1>
      <div className="flex flex-col justify-center items-center w-full gap-2.5">
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {selectableAmounts.map((amount) => (
            <NBButton
              key={amount}
              className="w-full"
              buttonColor={amountSelected === amount ? "blue" : "black"}
              onClick={() => setAmountSelected(amount)}>
              <p
                className={cn(
                  "text-[16px] font-extrabold",
                  amountSelected === amount && "text-accent",
                )}>
                ${amount}
              </p>
            </NBButton>
          ))}
        </div>
        <NBButton
          className="w-full"
          buttonColor={amountSelected === "custom" ? "blue" : "black"}
          onClick={() => setAmountSelected("custom")}>
          <p
            className={cn(
              "text-[16px] font-extrabold",
              amountSelected === "custom" && "text-accent",
            )}>
            Custom
          </p>
        </NBButton>
        <AnimatePresence mode="wait">
          {amountSelected === "custom" && (
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
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-5 mt-14">
        <AnimatePresence mode="wait">
          {!!amountSelected && (
            <div className="flex flex-col justify-center items-center w-full gap-2.5">
              <p className="text-[16px] font-bold text-black/25">
                You&apos;re getting 124,582 ${tokenName}
              </p>
              <NBButton key="confirm" className="w-full bg-accent">
                <p className="text-[16px] text-white font-extrabold">Confirm</p>
              </NBButton>
            </div>
          )}
        </AnimatePresence>
        <button
          className="text-[16px] font-bold text-black"
          onClick={handleModalOpen}>
          Cancel
        </button>
      </div>
    </NBModal>
  );
};
