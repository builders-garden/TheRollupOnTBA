import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NBButton } from "./nb-button";
import { NBModal } from "./nb-modal";
import { TopUpModal } from "./top-up-modal";
import { WithdrawModal } from "./withdraw-modal";

export const BottomNavbar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  // Handle Navbar Open
  const handleNavbarOpen = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-transparent px-5 pb-5 pt-3 transition-all duration-300",
        isNavbarOpen && "bg-background/90",
      )}>
      <div className="flex justify-between items-center w-full">
        <NBButton
          className="rounded-full py-1 w-[106px] shrink-0"
          onClick={handleNavbarOpen}>
          <div className="flex justify-center items-center w-full gap-1.5">
            <div className="size-[24px] bg-warning rounded-full border border-black" />
            <p className="text-[20px] font-bold">$5.76</p>
          </div>
        </NBButton>
        <div className="flex justify-center items-center w-full gap-1.5 flex-shrink-1">
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="size-1 bg-destructive rounded-full"
          />
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="size-1 bg-warning rounded-full"
          />
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="size-1 bg-accent rounded-full"
          />
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="size-1 bg-success rounded-full"
          />
        </div>

        <div className="flex justify-center items-center gap-2.5 shrink-0">
          <WithdrawModal isNavbarOpen={isNavbarOpen} />
          <TopUpModal isNavbarOpen={isNavbarOpen} />
        </div>
      </div>
    </nav>
  );
};
