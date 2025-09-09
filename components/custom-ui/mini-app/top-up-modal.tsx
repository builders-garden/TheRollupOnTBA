import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../../shadcn-ui/input";
import { NBButton } from "../nb-button";
import { NBModal } from "../nb-modal";

interface TopUpModalProps {
  isNavbarOpen: boolean;
}

type SelectableAmount = "1" | "3" | "5" | "10" | "custom";

export const TopUpModal = ({ isNavbarOpen }: TopUpModalProps) => {
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
      trigger={
        <NBButton
          initial={{
            scale: 0,
            boxShadow: "4px 4px 0px 0px #000000",
            border: "1px solid #000000",
          }}
          animate={{
            scale: isNavbarOpen ? 1 : 0,
            boxShadow: "4px 4px 0px 0px #000000",
            border: "1px solid #000000",
            transition: {
              default: { type: "tween", delay: 0.2 },
            },
          }}
          className="w-full px-1.5 bg-accent">
          <p className="text-base font-extrabold text-white">Top Up</p>
        </NBButton>
      }
      isOpen={isModalOpen}
      setIsOpen={handleModalOpen}
      contentClassName="p-2.5 rounded-[12px]">
      <h1 className="text-2xl font-bold text-center">Top Up your account</h1>
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
                  "text-base font-extrabold",
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
              "text-base font-extrabold",
              amountSelected === "custom" && "text-accent",
            )}>
            Custom
          </p>
        </NBButton>
        <AnimatePresence mode="wait">
          {amountSelected === "custom" && (
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
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-5 mt-14">
        <AnimatePresence mode="wait">
          {!!amountSelected && (
            <NBButton key="confirm" className="w-full bg-accent">
              <p className="text-base font-extrabold text-white">Confirm</p>
            </NBButton>
          )}
        </AnimatePresence>
        <button
          className="text-base font-bold text-black"
          onClick={handleModalOpen}>
          Cancel
        </button>
      </div>
    </NBModal>
  );
};
