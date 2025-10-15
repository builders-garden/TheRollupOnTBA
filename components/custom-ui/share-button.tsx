import sdk from "@farcaster/miniapp-sdk";
import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { cn, copyToClipboard } from "@/lib/utils";

interface ShareButtonProps {
  side?: "left" | "right" | "top" | "bottom" | undefined;
  buttonSize?: "sm" | "default" | "lg";
  buttonClassName?: string;
  showText?: boolean;
  miniappUrl?: string;
  copyLinkText?: string;
  handleShare?: () => void;
  brandName?: string;
}

export const ShareButton = ({
  side = "top",
  buttonSize = "default",
  buttonClassName,
  showText = false,
  miniappUrl,
  copyLinkText,
  brandName,
}: ShareButtonProps) => {
  const [linkCopied, setLinkCopied] = useState(false);

  // Handles sharing the miniapp on farcaster
  const handleShareClick = () => {
    if (!miniappUrl) return;
    const embedsTuple: [string] = [miniappUrl];
    const composeCastParams = {
      text: brandName
        ? `Watch this livestream by ${brandName}!`
        : "Watch this livestream!",
      embeds: embedsTuple,
    };
    sdk.actions.composeCast(composeCastParams);
  };

  // Handles the copy link
  const handleCopyLink = async () => {
    setLinkCopied(true);
    await copyToClipboard(copyLinkText || miniappUrl);
    setTimeout(() => {
      setLinkCopied(false);
    }, 1000);
  };

  // If there is no miniapp url and there is a copy link text, return a simple button
  if (!miniappUrl && copyLinkText) {
    return (
      <button
        className={cn("w-full focus:outline-none", buttonClassName)}
        aria-label="Share options"
        onClick={handleCopyLink}>
        <AnimatePresence mode="wait">
          {linkCopied ? (
            <motion.div
              key="check"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}>
              <CheckIcon
                className={cn(
                  "text-success",
                  buttonSize === "sm"
                    ? "size-4"
                    : buttonSize === "default"
                      ? "size-5"
                      : "size-7",
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}>
              <Share2Icon
                className={cn(
                  buttonSize === "sm"
                    ? "size-5"
                    : buttonSize === "default"
                      ? "size-7"
                      : "size-8",
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn("w-full focus:outline-none", buttonClassName)}
          aria-label="Share options">
          <Share2Icon
            className={cn(
              buttonSize === "sm"
                ? "size-5"
                : buttonSize === "default"
                  ? "size-6"
                  : "size-7",
            )}
          />
          {showText ? "Share" : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side}>
        {miniappUrl && (
          <DropdownMenuItem
            onClick={handleShareClick}
            className="gap-2 focus:bg-transparent">
            <div
              className={cn(
                "bg-blue-600 rounded-[3px]",
                buttonSize === "sm"
                  ? "size-4"
                  : buttonSize === "default"
                    ? "size-5"
                    : "size-7",
              )}
            />
            Share via Base App
          </DropdownMenuItem>
        )}
        {copyLinkText && (
          <DropdownMenuItem
            onSelect={handleCopyLink}
            className="gap-2 focus:bg-transparent">
            {linkCopied ? (
              <CheckIcon
                className={cn(
                  buttonSize === "sm"
                    ? "size-4"
                    : buttonSize === "default"
                      ? "size-5"
                      : "size-7",
                )}
              />
            ) : (
              <CopyIcon
                className={cn(
                  buttonSize === "sm"
                    ? "size-4"
                    : buttonSize === "default"
                      ? "size-5"
                      : "size-7",
                )}
              />
            )}
            Copy link
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
