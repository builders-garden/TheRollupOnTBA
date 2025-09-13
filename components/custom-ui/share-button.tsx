import sdk from "@farcaster/miniapp-sdk";
import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
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
  miniappUrl: string;
  linkCopied: boolean;
  handleShare?: () => void;
}

export const ShareButton = ({
  side = "top",
  buttonSize = "default",
  buttonClassName,
  showText = false,
  miniappUrl,
  linkCopied,
}: ShareButtonProps) => {
  // Handles sharing the miniapp on farcaster
  const handleShareClick = () => {
    const embedsTuple: [string] = [miniappUrl];
    const composeCastParams = {
      text: "Watch this stream by The Rollup",
      embeds: embedsTuple,
    };
    sdk.actions.composeCast(composeCastParams);
  };

  // Handles the copy link
  const handleCopyLink = async () => {
    await copyToClipboard(miniappUrl);
  };

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
                  ? "size-7"
                  : "size-8",
            )}
          />
          {showText ? "Share" : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
