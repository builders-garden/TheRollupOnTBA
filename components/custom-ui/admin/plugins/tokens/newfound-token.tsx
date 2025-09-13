import { SquareArrowOutUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { TokenNameToChainExplorerStringUrls } from "@/lib/constants";
import { Token } from "@/lib/types/tokens.type";
import {
  cn,
  deepCompareZerionTokens,
  formatWalletAddress,
  getChainName,
} from "@/lib/utils";

interface NewfoundTokenProps {
  token: Token;
  selectedTokens: Token[];
  setSelectedTokens: Dispatch<SetStateAction<Token[]>>;
  disabled: boolean;
  index: number;
}

export const NewfoundToken = ({
  token,
  selectedTokens,
  setSelectedTokens,
  disabled,
  index,
}: NewfoundTokenProps) => {
  const isSelected = selectedTokens.some((t) =>
    deepCompareZerionTokens(t, token),
  );

  // Disabled state for the token if it's not selectable anymore
  const isNotSelectable = disabled && !isSelected;

  // The explorer string url for the token
  const explorerStringUrl =
    TokenNameToChainExplorerStringUrls[
      token.chainId! as keyof typeof TokenNameToChainExplorerStringUrls
    ];

  // Handles the removal of the token from the list if the selected state becomes false
  const handleRemoveToken = () => {
    if (isNotSelectable) return;
    setSelectedTokens(
      selectedTokens.filter((t) => !deepCompareZerionTokens(t, token)),
    );
  };

  // Handles the addition of the token to the list if the selected state becomes true
  const handleAddToken = () => {
    if (isNotSelectable) return;
    setSelectedTokens([...selectedTokens, token]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: 0.1 * index, ease: "easeInOut" }}
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
        <Image
          src={token.iconUrl || "/images/coin.svg"}
          alt={token.name}
          className="size-10 rounded-full"
          width={40}
          height={40}
        />
        <div className="flex flex-col justify-start items-start gap-0.5">
          <h1 className="text-lg font-bold">{token.name}</h1>
          <p className="text-sm opacity-50 font-bold">{token.symbol}</p>
        </div>
      </div>
      <div className="flex justify-end items-center gap-5">
        <div className="flex flex-col justify-start items-end gap-0.5">
          <p className="text-sm opacity-50 font-bold">
            {getChainName(token.chainId!)}
          </p>
          {token.address ? (
            <p className="text-sm opacity-50 font-bold">
              {formatWalletAddress(token.address)}
            </p>
          ) : (
            <p className="text-sm opacity-50 font-bold">No Address</p>
          )}
        </div>
        {token.address ? (
          <motion.button
            className="cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onClick={() => {
              window.open(
                `${explorerStringUrl}/token/${token.address}`,
                "_blank",
              );
            }}>
            <SquareArrowOutUpRight className="size-7 opacity-50" />
          </motion.button>
        ) : (
          <div className="size-7" />
        )}
      </div>
    </motion.div>
  );
};
