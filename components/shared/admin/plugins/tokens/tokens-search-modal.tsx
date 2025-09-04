import { Filter, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/shadcn-ui/select";
import { NBButton } from "@/components/shared/nb-button";
import { NBModal } from "@/components/shared/nb-modal";
import { BASE_APP_SUPPORTED_CHAINS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const TokensSearchModal = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<string | undefined>(
    undefined,
  );

  // Current selected chain
  const selectedChain = selectedChainId
    ? BASE_APP_SUPPORTED_CHAINS.find(
        (chain) => chain.chainId === selectedChainId,
      )
    : undefined;

  // Handles the modal close
  const handleModalClose = () => {
    setTimeout(() => {
      setSearchValue("");
      setSelectedChainId(undefined);
    }, 300);
  };

  return (
    <NBModal
      trigger={
        <NBButton className="bg-accent w-[200px]">
          <div className="flex justify-center items-center w-full gap-1.5 text-white">
            <Plus className="size-4.5" />
            <p className="text-[16px] font-extrabold text-nowrap">
              Add more tokens
            </p>
          </div>
        </NBButton>
      }
      setIsOpen={handleModalClose}
      contentClassName="p-4 rounded-[12px] sm:max-w-2xl">
      <h1 className="text-[24px] font-bold text-center">Search for a token</h1>
      <div className="flex justify-between items-center w-full gap-2.5">
        <div
          className={cn(
            "flex w-full justify-start items-center gap-2.5 rounded-full border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white transition-all duration-300",
            isEditing && "ring-[2px]",
          )}>
          <Search className="size-5" />
          <input
            type="text"
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Search for a token"
            className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
        </div>
        <Select
          onValueChange={(value) =>
            setSelectedChainId(value === "No Chain" ? undefined : value)
          }>
          <SelectTrigger className="w-[190px] shrink-0 min-h-full bg-white cursor-pointer border-accent border-[1px] focus-visible:ring-accent/40 focus-visible:ring-[2px] rounded-full">
            <div className="flex justify-start items-center w-full h-full">
              <AnimatePresence mode="wait">
                {selectedChain ? (
                  <motion.div
                    key={`selected-chain-${selectedChain.name}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="flex justify-start items-center w-full h-full gap-2.5 px-1">
                    <img
                      src={selectedChain.logoUrl}
                      alt={selectedChain.name}
                      className="size-[19px] rounded-full"
                    />
                    <p className="text-[16px]">{selectedChain?.name}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="filter-by-chain"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="flex justify-start items-center w-full h-full gap-2.5 px-1">
                    <Filter className="size-4.5 text-black" />
                    <p className="text-[16px] opacity-50">Filter by chain</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No Chain" className="text-[16px]">
              No Chain
            </SelectItem>
            {BASE_APP_SUPPORTED_CHAINS.map((chain) => (
              <SelectItem
                key={chain.chainId}
                value={chain.chainId}
                className="flex items-center gap-2.5">
                <img
                  src={chain.logoUrl}
                  alt={chain.name}
                  className="size-[19px] rounded-full"
                />
                <p className="text-[16px]">{chain.name}</p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex flex-col justify-start items-start w-full h-[300px]"></ScrollArea>
    </NBModal>
  );
};
