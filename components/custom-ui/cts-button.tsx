import { motion, TargetAndTransition, VariantLabels } from "motion/react";
import { cn } from "@/lib/utils";

interface CTSButtonProps {
  onClick?: () => void;
  variant?: "ghost" | "default" | "outline" | "destructive";
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
  const isDestructive = variant === "destructive";

  return (
    <motion.button
      initial={
        initial || {
          opacity: disabled ? 0.4 : 1,
        }
      }
      animate={
        animate || {
          opacity: disabled ? 0.4 : 1,
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
        "flex justify-center items-center w-[100px] py-2 px-3 rounded-[12px] bg-primary text-background text-base font-extrabold transition-colors duration-300 cursor-pointer hover:bg-primary/80 ",
        className,
        isGhost ? "bg-transparent text-muted" : undefined,
        isOutline
          ? "border border-muted bg-transparent hover:bg-muted/10 text-muted"
          : undefined,
        isDestructive &&
          "bg-destructive hover:bg-destructive/80 text-foreground",
        disabled &&
          "cursor-default" +
            (isGhost || isOutline
              ? " hover:bg-transparent"
              : isDestructive
                ? " hover:bg-destructive"
                : " hover:bg-primary"),
      )}
      onClick={onClick}
      disabled={disabled}>
      {children}
    </motion.button>
  );
};
