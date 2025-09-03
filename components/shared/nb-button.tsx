import { motion, TargetAndTransition, VariantLabels } from "motion/react";
import { cn } from "@/lib/utils";

interface NBButtonProps {
  onClick?: () => void;
  buttonColor?: "black" | "blue" | "red";
  ghost?: boolean;
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
  ghost = false,
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
          boxShadow: ghost
            ? "none"
            : buttonColor === "blue"
              ? "4px 4px 0px 0px #4968D7"
              : buttonColor === "red"
                ? "4px 4px 0px 0px #cf5954"
                : "4px 4px 0px 0px #000000",
          border: ghost
            ? "1px solid transparent"
            : buttonColor === "blue"
              ? "1px solid #4968D7"
              : buttonColor === "red"
                ? "1px solid #cf5954"
                : "1px solid #000000",
          backgroundColor: ghost ? "transparent" : "#f6f5f2",
        }
      }
      animate={
        animate || {
          boxShadow: ghost
            ? "none"
            : buttonColor === "blue"
              ? "4px 4px 0px 0px #4968D7"
              : buttonColor === "red"
                ? "4px 4px 0px 0px #cf5954"
                : "4px 4px 0px 0px #000000",
          border: ghost
            ? "1px solid transparent"
            : buttonColor === "blue"
              ? "1px solid #4968D7"
              : buttonColor === "red"
                ? "1px solid #cf5954"
                : "1px solid #000000",
          backgroundColor: ghost ? "transparent" : "#f6f5f2",
        }
      }
      exit={exit}
      whileTap={
        whileTap ||
        (ghost
          ? {
              scale: 0.98,
            }
          : {
              x: 4,
              y: 4,
              boxShadow: "none",
            })
      }
      whileHover={whileHover}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex justify-center items-center w-[100px] p-2 rounded-[12px] cursor-pointer",
        className,
      )}
      onClick={onClick}
      disabled={disabled}>
      {children}
    </motion.button>
  );
};
