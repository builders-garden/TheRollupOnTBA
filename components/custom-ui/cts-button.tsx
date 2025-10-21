import { motion, TargetAndTransition, VariantLabels } from "motion/react";
import { cn } from "@/lib/utils";

interface CTSButtonProps {
  onClick?: () => void;
  variant?: "ghost" | "default" | "outline";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  whileTap?: VariantLabels | TargetAndTransition;
  whileHover?: VariantLabels | TargetAndTransition;
  initial?: TargetAndTransition | VariantLabels | boolean;
  animate?: TargetAndTransition | VariantLabels | boolean;
  exit?: TargetAndTransition | VariantLabels;
}

export const CTSButton = ({
  onClick,
  disabled,
  variant = "default",
  className,
  children,
  initial,
  animate,
  exit,
  whileTap,
  whileHover,
}: CTSButtonProps) => {
  // Whether the variant is ghost, default, or outline
  const isGhost = variant === "ghost";
  const isOutline = variant === "outline";

  return (
    <motion.button
      initial={
        initial || {
          opacity: disabled ? 0.5 : 1,
        }
      }
      animate={
        animate || {
          opacity: disabled ? 0.5 : 1,
        }
      }
      exit={exit}
      whileTap={
        disabled
          ? undefined
          : whileTap || {
              scale: 0.97,
            }
      }
      whileHover={
        disabled
          ? undefined
          : whileHover || {
              scale: 1.01,
            }
      }
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "flex justify-center items-center w-[100px] py-2 px-3 rounded-[12px] bg-primary text-background transition-colors duration-300 cursor-pointer hover:bg-primary/80",
        className,
        isGhost ? "bg-transparent text-muted" : undefined,
        isOutline
          ? "border border-muted bg-transparent hover:bg-muted/10 text-muted"
          : undefined,
        disabled && "cursor-default",
      )}
      onClick={onClick}
      disabled={disabled}>
      {children}
    </motion.button>
  );
};
