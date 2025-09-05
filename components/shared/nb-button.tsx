import { motion, TargetAndTransition, VariantLabels } from "motion/react";
import { cn } from "@/lib/utils";

interface NBButtonProps {
  onClick?: () => void;
  buttonColor?: "black" | "blue" | "red";
  variant?: "ghost" | "default" | "outline";
  showShadow?: boolean;
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
  variant = "default",
  showShadow = true,
  className,
  children,
  initial,
  animate,
  exit,
  whileTap,
  whileHover,
}: NBButtonProps) => {
  // Whether the variant is ghost, default, or outline
  const isGhost = variant === "ghost";
  const isOutline = variant === "outline";

  return (
    <motion.button
      initial={
        initial || {
          boxShadow:
            isGhost || !showShadow
              ? "none"
              : buttonColor === "blue"
                ? "4px 4px 0px 0px #4968D7"
                : buttonColor === "red"
                  ? "4px 4px 0px 0px #cf5954"
                  : "4px 4px 0px 0px #000000",
          border: isGhost
            ? "1px solid transparent"
            : buttonColor === "blue"
              ? "1px solid #4968D7"
              : buttonColor === "red"
                ? "1px solid #cf5954"
                : "1px solid #000000",
          opacity: disabled ? 0.5 : 1,
        }
      }
      animate={
        animate || {
          boxShadow:
            isGhost || !showShadow
              ? "none"
              : buttonColor === "blue"
                ? "4px 4px 0px 0px #4968D7"
                : buttonColor === "red"
                  ? "4px 4px 0px 0px #cf5954"
                  : "4px 4px 0px 0px #000000",
          border: isGhost
            ? "1px solid transparent"
            : buttonColor === "blue"
              ? "1px solid #4968D7"
              : buttonColor === "red"
                ? "1px solid #cf5954"
                : "1px solid #000000",
          opacity: disabled ? 0.5 : 1,
        }
      }
      exit={exit}
      whileTap={
        disabled
          ? undefined
          : whileTap ||
            (isGhost || isOutline
              ? {
                  scale: 0.98,
                }
              : {
                  x: 4,
                  y: 4,
                  boxShadow: "none",
                })
      }
      whileHover={disabled ? undefined : whileHover}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex justify-center items-center w-[100px] py-2 px-3 rounded-[12px] transition-colors duration-300 cursor-pointer",
        isGhost || isOutline ? "bg-transparent" : "bg-background",
        disabled && "cursor-default",
        className,
      )}
      onClick={onClick}
      disabled={disabled}>
      {children}
    </motion.button>
  );
};
