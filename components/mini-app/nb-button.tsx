import { motion, TargetAndTransition, VariantLabels } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface NBButtonProps {
  onClick?: () => void;
  buttonColor?: "black" | "blue";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  whileTap?: VariantLabels | TargetAndTransition;
  whileHover?: VariantLabels | TargetAndTransition;
  initial?: TargetAndTransition | VariantLabels | boolean;
  animate?: TargetAndTransition | VariantLabels | boolean;
  exit?: TargetAndTransition | VariantLabels;
}

export const NBButton = ({
  onClick,
  disabled,
  buttonColor = "black",
  className,
  children,
  initial,
  animate,
  exit,
  whileTap,
  whileHover,
}: NBButtonProps) => {
  return (
    <motion.button
      initial={
        initial || {
          boxShadow:
            buttonColor === "blue"
              ? "4px 4px 0px 0px #4968D7"
              : "4px 4px 0px 0px #000000",
        }
      }
      animate={
        animate || {
          boxShadow:
            buttonColor === "blue"
              ? "4px 4px 0px 0px #4968D7"
              : "4px 4px 0px 0px #000000",
        }
      }
      exit={exit}
      whileTap={
        whileTap || {
          x: 4,
          y: 4,
          boxShadow: "none",
        }
      }
      whileHover={whileHover}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex justify-center items-center bg-background border w-[100px] py-2 rounded-[12px] transition-colors duration-300",
        buttonColor === "black" ? "border-black" : "border-accent",
        className,
      )}
      onClick={onClick}
      disabled={disabled}>
      {children}
    </motion.button>
  );
};
