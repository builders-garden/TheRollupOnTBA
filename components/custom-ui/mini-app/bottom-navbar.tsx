import { motion } from "motion/react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { cn, formatWalletAddress } from "@/lib/utils";
import { NBButton } from "../nb-button";

interface BottomNavbarProps {
  userProfilePicture: string;
}

export const BottomNavbar = ({ userProfilePicture }: BottomNavbarProps) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { address } = useAccount();
  const { balance: usdcBalance } = useUsdcBalance({ address });

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
            {userProfilePicture ? (
              <img
                src={userProfilePicture}
                alt="User profile picture"
                className="size-[24px] bg-warning rounded-full border border-black"
              />
            ) : (
              <div className="size-[24px] bg-warning rounded-full border border-black" />
            )}
            <p className="text-xl font-bold">
              ${Number(usdcBalance?.formatted).toFixed(1)}
            </p>
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

        {address && isNavbarOpen && (
          <div className="flex justify-center items-center shrink-0">
            {formatWalletAddress(address)}
          </div>
        )}
      </div>
    </nav>
  );
};
