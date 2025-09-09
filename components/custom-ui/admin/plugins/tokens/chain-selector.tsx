import { Filter } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/shadcn-ui/select";
import { BASE_APP_SUPPORTED_CHAINS } from "@/lib/constants";

interface ChainSelectorProps {
  selectedChainName: string | undefined;
  setSelectedChainName: Dispatch<SetStateAction<string | undefined>>;
}

export const ChainSelector = ({
  selectedChainName,
  setSelectedChainName,
}: ChainSelectorProps) => {
  // Current selected chain
  const selectedChain = selectedChainName
    ? BASE_APP_SUPPORTED_CHAINS.find(
        (chain) => chain.zerionName === selectedChainName,
      )
    : undefined;

  return (
    <Select
      onValueChange={(value) =>
        setSelectedChainName(value === "No Chain" ? undefined : value)
      }>
      <SelectTrigger className="w-[190px] shrink-0 min-h-full bg-white cursor-pointer border-accent border-[1px] focus-visible:ring-accent/40 focus-visible:ring-[2px] rounded-full">
        <div className="flex justify-start items-center w-full h-full">
          <AnimatePresence mode="wait" initial={false}>
            {selectedChain ? (
              <motion.div
                key={`selected-chain-${selectedChain.name}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
                className="flex justify-start items-center w-full h-full gap-2.5 px-1">
                <img
                  src={selectedChain.logoUrl}
                  alt={selectedChain.name}
                  className="size-[19px] rounded-full"
                />
                <p className="text-base">{selectedChain?.name}</p>
              </motion.div>
            ) : (
              <motion.div
                key="filter-by-chain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
                className="flex justify-start items-center w-full h-full gap-2.5 px-1">
                <Filter className="size-4.5 text-black" />
                <p className="text-base opacity-50">Filter by chain</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="No Chain" className="text-base">
          No Chain
        </SelectItem>
        {BASE_APP_SUPPORTED_CHAINS.map((chain) => (
          <SelectItem
            key={chain.chainId}
            value={chain.zerionName}
            className="flex items-center gap-2.5">
            <img
              src={chain.logoUrl}
              alt={chain.name}
              className="size-[19px] rounded-full"
            />
            <p className="text-base">{chain.name}</p>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
