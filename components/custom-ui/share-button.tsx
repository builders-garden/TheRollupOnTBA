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
  navigatorTitle?: string;
  navigatorText?: string;
  miniappUrl: string;
  linkCopied: boolean;
  handleShare?: () => void;
}

export const ShareButton = ({
  side = "top",
  buttonSize = "default",
  buttonClassName,
  showText = false,
  navigatorTitle = "Starter!",
  navigatorText = `Check out this app on @farcaster`,
  miniappUrl,
  linkCopied,
  handleShare,
}: ShareButtonProps) => {
  const handleShareClick = () => {
    handleShare?.();
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: navigatorTitle,
          text: navigatorText,
          url: miniappUrl,
        });
      } catch (err) {
        // User cancelled or error
        console.error("user cancelled or error", err);
        await copyToClipboard(miniappUrl);
      }
    } else {
      await copyToClipboard(miniappUrl);
    }
  };

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
          Share via base app
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleShareNative}
          className="gap-2 focus:bg-transparent">
          <Share2Icon
            className={cn(
              buttonSize === "sm"
                ? "size-4"
                : buttonSize === "default"
                  ? "size-5"
                  : "size-7",
            )}
          />
          Share to...
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
