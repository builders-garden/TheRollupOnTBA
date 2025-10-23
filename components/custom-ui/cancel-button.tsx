import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CancelButtonProps {
  onClick: () => void;
  className?: string;
}

export const CancelButton = ({ onClick, className }: CancelButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "text-base font-bold text-foreground bg-card hover:bg-card/80 rounded-[12px] px-5 py-2.5 cursor-pointer w-full trasnition-colors duration-200",
        className,
      )}
      onClick={onClick}>
      Cancel
    </motion.button>
  );
};
