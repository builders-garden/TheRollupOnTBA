import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { FarcasterIcon } from "@/components/shared/icons/farcaster-icon";
import { cn, copyToClipboard } from "@/lib/utils";

interface ShareButtonProps {
  side?: "left" | "right" | "top" | "bottom" | undefined;
  buttonSize?: "sm" | "default" | "lg" | "icon" | null | undefined;
  navigatorTitle?: string;
  navigatorText?: string;
  miniappUrl: string;
  linkCopied: boolean;
  setLinkCopied: Dispatch<SetStateAction<boolean>>;
  handleShare?: () => void;
}

export const ShareButton = ({
  side = "top",
  buttonSize = "sm",
  navigatorTitle = "Starter!",
  navigatorText = `Check out this app on @farcaster`,
  miniappUrl,
  linkCopied,
  setLinkCopied,
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
        await copyToClipboard(miniappUrl, setLinkCopied);
      }
    } else {
      await copyToClipboard(miniappUrl, setLinkCopied);
    }
  };

  const handleCopyLink = async () => {
    await copyToClipboard(miniappUrl, setLinkCopied);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn("w-full", buttonSize === "icon" && "p-2")}
          aria-label="Share options">
          <Share2Icon className="size-4" />
          {buttonSize === "icon" ? null : "Share"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side}>
        <DropdownMenuItem onClick={handleShareClick} className="gap-2">
          <FarcasterIcon className="size-4" />
          Share via cast
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareNative} className="gap-2">
          <Share2Icon className="size-4" />
          Share to...
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyLink} className="gap-2">
          {linkCopied ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
