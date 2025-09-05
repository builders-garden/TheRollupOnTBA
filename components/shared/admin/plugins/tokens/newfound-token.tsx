import { CircleQuestionMark, SquareArrowOutUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { Token } from "@/lib/types/tokens.type";
import { cn, formatWalletAddress, getChainName } from "@/lib/utils";

interface NewfoundTokenProps {
  token: Token;
  selectedTokens: Token[];
  setSelectedTokens: Dispatch<SetStateAction<Token[]>>;
  disabled: boolean;
}

export const NewfoundToken = ({
  token,
  selectedTokens,
  setSelectedTokens,
  disabled,
}: NewfoundTokenProps) => {
  const isSelected = selectedTokens.some((t) => t.address === token.address);

  const isNotSelectable = disabled && !isSelected;

  // Handles the removal of the token from the list if the selected state becomes false
  const handleRemoveToken = () => {
    if (isNotSelectable) return;
    setSelectedTokens(
      selectedTokens.filter((token) => token.address !== token.address),
    );
  };

  // Handles the addition of the token to the list if the selected state becomes true
  const handleAddToken = () => {
    if (isNotSelectable) return;
    setSelectedTokens([...selectedTokens, token]);
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center w-full rounded-[12px] p-2.5 border-[1px] border-transparent",
        isSelected && "border-accent",
        isNotSelectable && "opacity-50",
      )}>
      <div className="flex justify-start items-center gap-2.5">
        <Checkbox
          checked={isSelected}
          disabled={isNotSelectable}
          onCheckedChange={(checked) =>
            checked ? handleAddToken() : handleRemoveToken()
          }
          className="size-6 data-[state=checked]:bg-accent data-[state=checked]:border-accent mx-1.5"
        />
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
      <div className="flex justify-end items-center gap-5">
        <div className="flex flex-col justify-start items-end gap-1">
          <p className="text-[14px] opacity-50 font-bold">
            {getChainName(token.chainId!)}
          </p>
          <p className="text-[14px] opacity-50 font-bold">
            {formatWalletAddress(token.address!)}
          </p>
        </div>
        <motion.button
          className="cursor-pointer"
          onClick={() => {}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}>
          <SquareArrowOutUpRight className="size-7 opacity-50" />
        </motion.button>
      </div>
    </div>
  );
};
