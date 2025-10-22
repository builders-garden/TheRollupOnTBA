import { Check, Copy, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn, copyToClipboard } from "@/lib/utils";

interface CopyButtonProps {
  stringToCopy: string;
  size?: "sm" | "md" | "lg";
}

export const CopyButton = ({ stringToCopy, size = "md" }: CopyButtonProps) => {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Handles the copy button
  const handleCopy = () => {
    setIsCopying(true);
    setTimeout(() => {
      copyToClipboard(stringToCopy);
      setIsCopying(false);
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 1000);
    }, 1000);
    setTimeout(() => {
      copyToClipboard(stringToCopy);
      setIsCopying(false);
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center">
      <AnimatePresence mode="wait">
        {isCopying && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}>
            <Loader2
              className={cn(
                "size-6 text-foreground animate-spin",
                size === "sm" ? "size-5" : size === "lg" ? "size-7" : "size-6",
              )}
            />
          </motion.div>
        )}
        {hasCopied && (
          <motion.div
            key="check"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}>
            <Check
              className={cn(
                "size-6 text-success",
                size === "sm" ? "size-5" : size === "lg" ? "size-7" : "size-6",
              )}
            />
          </motion.div>
        )}
        {!isCopying && !hasCopied && (
          <motion.button
            key="copy-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="cursor-pointer shrink-0"
            onClick={handleCopy}>
            <Copy
              className={cn(
                "size-6 text-muted-foreground",
                size === "sm" ? "size-5" : size === "lg" ? "size-7" : "size-6",
              )}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
