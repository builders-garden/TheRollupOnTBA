import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import {
  useDeleteFeaturedToken,
  useUpdateFeaturedToken,
} from "@/hooks/use-featured-tokens";
import { FeaturedToken } from "@/lib/database/db.schema";
import { cn, formatWalletAddress, getChainName } from "@/lib/utils";

interface AddedTokenProps {
  token: FeaturedToken;
  index: number;
}

export const AddedToken = ({ token, index }: AddedTokenProps) => {
  const { featuredTokens } = useAdminAuth();
  const { mutate: deleteFeaturedToken } = useDeleteFeaturedToken();
  const { mutate: updateFeaturedToken } = useUpdateFeaturedToken();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Whether the token is visible
  const isVisible = token.isActive;

  // Handles the deletion of the token from the list
  const handleDeleteToken = () => {
    setIsDeleting(true);
    deleteFeaturedToken(
      { tokenId: token.id },
      {
        onSuccess: async () => {
          await featuredTokens.refetch();
          setIsDeleting(false);
        },
        onError: () => {
          setIsDeleting(false);
          toast.error("An error occurred while deleting the token");
        },
      },
    );
  };

  // Handles the showing/hiding of the token
  const handleShowHideToken = () => {
    setIsUpdating(true);
    updateFeaturedToken(
      { tokenId: token.id, isActive: !isVisible },
      {
        onSuccess: async () => {
          await featuredTokens.refetch();
          setIsUpdating(false);
        },
        onError: () => {
          setIsUpdating(false);
          toast.error("An error occurred while updating the token");
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
      transition={{
        duration: 0.2,
        delay: 0.1 * index,
        ease: "easeInOut",
        layout: { duration: 0.185, ease: "easeOut" },
      }}>
      <NBCard className="p-5 gap-2.5 flex-1 min-w-[300px]">
        {/* Visibility indicator */}
        <div className="flex justify-start items-center w-full gap-1">
          {isVisible ? (
            <Eye className="size-3.5 text-accent" />
          ) : (
            <EyeOff className="size-3.5 opacity-50" />
          )}
          <p
            className={cn(
              "text-sm opacity-50 font-bold",
              isVisible && "text-accent opacity-100",
            )}>
            {isVisible ? "Visible" : "Hidden"}
          </p>
        </div>

        {/* Token information */}
        <div className="flex justify-between items-center w-full gap-3">
          <div className="flex justify-start items-center gap-2.5">
            <Image
              src={token.logoUrl || "/images/coin.svg"}
              alt={token.name ?? ""}
              className="size-10 rounded-full"
              priority
              width={40}
              height={40}
            />
            <div className="flex flex-col justify-start items-start gap-0.5">
              <h1 className="text-lg font-bold">{token.name}</h1>
              <p className="text-sm opacity-50 font-bold">{token.symbol}</p>
            </div>
          </div>
          <div className="flex flex-col justify-start items-end gap-0.5">
            <div className="flex justify-end items-center gap-1">
              <Image
                src={token.chainLogoUrl || ""}
                alt={token.chainId?.toString() || ""}
                className="size-3.5 rounded-full"
                width={14}
                height={14}
              />
              <p className="text-sm opacity-50 font-bold">
                {token.chainId
                  ? getChainName(token.chainId.toString())
                  : "Unknown chain"}
              </p>
            </div>
            {token.address ? (
              <Link
                href={token.externalUrl || ""}
                target="_blank"
                className="text-sm opacity-50 font-bold underline">
                {formatWalletAddress(token.address)}
              </Link>
            ) : (
              <p className="text-sm opacity-50 font-bold">No Address</p>
            )}
          </div>
        </div>

        {/* Delete and show/hide buttons */}
        <div className="flex justify-between items-center w-full gap-2.5">
          <NBButton
            className="w-full bg-destructive h-[42px]"
            onClick={handleDeleteToken}>
            <AnimatePresence mode="wait">
              {isDeleting ? (
                <motion.div
                  key="deleting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-white animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="remove"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <p className="text-base font-extrabold text-white">Remove</p>
                </motion.div>
              )}
            </AnimatePresence>
          </NBButton>
          <NBButton
            className="w-full bg-accent h-[42px]"
            onClick={handleShowHideToken}>
            <AnimatePresence mode="wait">
              {isUpdating ? (
                <motion.div
                  key="updating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-white animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="show-hide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <p className="text-base font-extrabold text-white">
                    {isVisible ? "Hide" : "Show"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </NBButton>
        </div>
      </NBCard>
    </motion.div>
  );
};
