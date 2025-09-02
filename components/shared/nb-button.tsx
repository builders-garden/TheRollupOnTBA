import { motion, TargetAndTransition, VariantLabels } from "motion/react";
import { cn } from "@/lib/utils";

interface NBButtonProps {
  onClick?: () => void;
  buttonColor?: "black" | "blue";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  animate?: TargetAndTransition | VariantLabels | boolean;
}

export const NBButton = ({
  onClick,
  disabled,
  buttonColor = "black",
  className,
  children,
  animate,
}: NBButtonProps) => {
  return (
    <motion.button
      animate={animate}
      whileTap={{
        x: 4,
        y: 4,
        boxShadow: "none",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex justify-center items-center bg-background border w-[100px] py-2 rounded-lg",
        buttonColor === "black"
          ? "border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          : "border-accent shadow-[4px_4px_0px_0px_rgba(73,104,215,1)]",
        className,
      )}
      onClick={onClick}
      disabled={disabled}>
      {children}
    </motion.button>
  );
};
