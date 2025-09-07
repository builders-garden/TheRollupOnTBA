import { CircleQuestionMark, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { Token } from "@/lib/types/tokens.type";
import {
  cn,
  deepCompareTokens,
  formatWalletAddress,
  getChainName,
} from "@/lib/utils";

interface AddedTokenProps {
  token: Token;
  addedTokens: Token[];
  setAddedTokens: Dispatch<SetStateAction<Token[]>>;
  index: number;
}

export const AddedToken = ({
  token,
  addedTokens,
  setAddedTokens,
  index,
}: AddedTokenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  // Handles the deletion of the token from the list
  const handleDeleteToken = () => {
    setAddedTokens(addedTokens.filter((t) => !deepCompareTokens(t, token)));
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
              "text-[14px] opacity-50 font-bold",
              isVisible && "text-accent opacity-100",
            )}>
            {isVisible ? "Visible" : "Hidden"}
          </p>
        </div>

        {/* Token information */}
        <div className="flex justify-between items-center w-full gap-3">
          <div className="flex justify-start items-center gap-2.5">
            {token.iconUrl ? (
              <Image
                src={token.iconUrl ?? ""}
                alt={token.name}
                className="size-10 rounded-full"
                width={40}
                height={40}
              />
            ) : (
              <CircleQuestionMark className="size-10 opacity-50 shrink-0" />
            )}
            <div className="flex flex-col justify-start items-start gap-0.5">
              <h1 className="text-[18px] font-bold">{token.name}</h1>
              <p className="text-[14px] opacity-50 font-bold">{token.symbol}</p>
            </div>
          </div>
          <div className="flex flex-col justify-start items-end gap-0.5">
            <p className="text-[14px] opacity-50 font-bold">
              {getChainName(token.chainId!)}
            </p>
            {token.address ? (
              <p className="text-[14px] opacity-50 font-bold">
                {formatWalletAddress(token.address!)}
              </p>
            ) : (
              <p className="text-[14px] opacity-50 font-bold">No Address</p>
            )}
          </div>
        </div>

        {/* Delete and show/hide buttons */}
        <div className="flex justify-between items-center w-full gap-2.5">
          <NBButton
            className="w-full bg-destructive"
            onClick={handleDeleteToken}>
            <p className="text-[16px] font-extrabold text-white">Remove</p>
          </NBButton>
          <NBButton
            className="w-full bg-accent"
            onClick={() => setIsVisible(!isVisible)}>
            <p className="text-[16px] font-extrabold text-white">
              {isVisible ? "Hide" : "Show"}
            </p>
          </NBButton>
        </div>
      </NBCard>
    </motion.div>
  );
};
