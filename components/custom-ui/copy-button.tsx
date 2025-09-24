import { Check, Copy, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";

interface CopyButtonProps {
  stringToCopy: string;
}

export const CopyButton = ({ stringToCopy }: CopyButtonProps) => {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Handles the copy button
  const handleCopy = () => {
    setIsCopying(true);
    copyToClipboard(stringToCopy);
    setIsCopying(false);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 450);
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
            <Loader2 className="size-6 text-black animate-spin" />
          </motion.div>
        )}
        {hasCopied && (
          <motion.div
            key="check"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}>
            <Check className="size-6 text-success" />
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
            <Copy className="size-6 text-accent" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
