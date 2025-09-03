import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../../shadcn-ui/input";
import { NBButton } from "./nb-button";
import { NBModal } from "./nb-modal";

interface WithdrawModalProps {
  isNavbarOpen: boolean;
}

type SelectedMode = "all" | "custom" | undefined;

export const WithdrawModal = ({ isNavbarOpen }: WithdrawModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<SelectedMode>(undefined);
  const [customAmount, setCustomAmount] = useState<string>("");

  // Handles Modal Open
  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
    // This prevents the values to reset before the modal closing animation is complete
    setTimeout(() => {
      setSelectedMode(undefined);
      setCustomAmount("");
    }, 300);
  };

  return (
    <NBModal
      trigger={
        <NBButton
          initial={{
            scale: 0,
            boxShadow: "4px 4px 0px 0px #000000",
          }}
          animate={{
            scale: isNavbarOpen ? 1 : 0,
            boxShadow: "4px 4px 0px 0px #000000",
            transition: {
              default: { type: "tween", delay: 0.1 },
            },
          }}
          className="w-full px-1.5">
          <p className="text-[16px] font-extrabold">Withdraw</p>
        </NBButton>
      }
      isOpen={isModalOpen}
      setIsOpen={handleModalOpen}
      contentClassName="p-2.5 rounded-[12px]">
      <h1 className="text-[24px] font-bold text-center">Withdraw Balance</h1>
      <div className="flex flex-col justify-center items-center w-full gap-2.5">
        <NBButton
          className="w-full"
          buttonColor={selectedMode === "all" ? "blue" : "black"}
          onClick={() => setSelectedMode("all")}>
          <p
            className={cn(
              "text-[16px] font-extrabold",
              selectedMode === "all" && "text-accent",
            )}>
            All
          </p>
        </NBButton>
        <NBButton
          className="w-full"
          buttonColor={selectedMode === "custom" ? "blue" : "black"}
          onClick={() => setSelectedMode("custom")}>
          <p
            className={cn(
              "text-[16px] font-extrabold",
              selectedMode === "custom" && "text-accent",
            )}>
            Custom
          </p>
        </NBButton>
        <AnimatePresence mode="wait">
          {selectedMode === "custom" && (
            <Input
              placeholder="Enter amount"
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
          {!!selectedMode && (
            <NBButton key="confirm" className="w-full bg-accent">
              <p className="text-[16px] font-extrabold text-white">
                Confirm $5.50 Withdrawal
              </p>
            </NBButton>
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
