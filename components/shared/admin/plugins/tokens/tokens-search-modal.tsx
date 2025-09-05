import ky from "ky";
import { Loader2, Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { isAddress } from "viem/utils";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { NBButton } from "@/components/shared/nb-button";
import { NBModal } from "@/components/shared/nb-modal";
import { useDebounce } from "@/hooks/use-debounce";
import { Token } from "@/lib/types/tokens.type";
import { cn } from "@/lib/utils";
import { ChainSelector } from "./chain-selector";
import { NewfoundToken } from "./newfound-token";

interface TokensSearchModalProps {
  addedTokens: Token[];
  setAddedTokens: Dispatch<SetStateAction<Token[]>>;
}

export const TokensSearchModal = ({
  addedTokens,
  setAddedTokens,
}: TokensSearchModalProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChainName, setSelectedChainName] = useState<
    string | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedTokens, setFetchedTokens] = useState<Token[]>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [fetchingError, setFetchingError] = useState<Error | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);

  // Debounce search value to avoid too frequent API calls
  const debouncedSearchValue = useDebounce(searchValue, 750);

  // Disabled state for the tokens
  const isLimitReached = addedTokens.length + selectedTokens.length >= 6;

  // Handles Modal Open
  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
    // This prevents the values to reset before the modal closing animation is complete
    setTimeout(() => {
      setSelectedChainName(undefined);
      setSearchValue("");
      setSelectedTokens([]);
      setFetchedTokens([]);
      setFetchingError(null);
      setIsFetchingTokens(false);
      setHasFetchedOnce(false);
    }, 300);
  };

  // When the search changes or the chain changes, fetch the new tokens
  useEffect(() => {
    const fetchTokens = async () => {
      setIsFetchingTokens(true);
      try {
        let searchParams = "";
        if (debouncedSearchValue) {
          if (isAddress(debouncedSearchValue)) {
            searchParams += `&token_address=${debouncedSearchValue}`;
          } else {
            searchParams += `&search_query=${debouncedSearchValue}`;
          }
        }
        const tokens = await ky
          .get<{
            data: Token[];
            success: boolean;
          }>(`/api/tokens?chain_id=${selectedChainName}${searchParams}`)
          .json();

        if (tokens.success) {
          console.log("TEST tokens", tokens);
          setFetchedTokens(tokens.data);
        } else {
          setFetchingError(
            new Error("An error occurred, please try again later."),
          );
        }
      } catch (error) {
        console.error("Error fetching tokens", error);
        setFetchingError(error as Error);
      } finally {
        setIsFetchingTokens(false);
        setHasFetchedOnce(true);
      }
    };

    if (selectedChainName && !isFetchingTokens) {
      fetchTokens();
    }
  }, [selectedChainName, debouncedSearchValue]);

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
      isOpen={isModalOpen}
      setIsOpen={handleModalOpen}
      contentClassName="p-4 rounded-[12px] sm:max-w-2xl">
      <h1 className="text-[24px] font-bold text-center">Search for a token</h1>

      {/* Search and filter by chain */}
      <div className="flex justify-between items-center w-full gap-2.5">
        <div
          className={cn(
            "flex w-full justify-start items-center gap-2.5 rounded-full border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white transition-all duration-300",
            isEditing && "ring-[2px]",
          )}>
          <Search className="size-5 shrink-0" />
          <input
            type="text"
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Search for a token by its name or address"
            className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onClick={() => {
              setSearchValue("");
            }}
            className="cursor-pointer">
            <X className="size-5 shrink-0" />
          </motion.button>
        </div>
        <ChainSelector
          selectedChainName={selectedChainName}
          setSelectedChainName={setSelectedChainName}
        />
      </div>

      {/* Found tokens list */}
      <ScrollArea className="w-full h-[392px] mt-[18px]">
        <AnimatePresence mode="wait" initial={false}>
          {fetchingError ? (
            <motion.div
              key="fetching-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-[18px] font-bold text-destructive">
                An error occurred, please try again later.
              </p>
            </motion.div>
          ) : isFetchingTokens ? (
            <motion.div
              key="fetching-tokens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <Loader2 className="size-8 text-black animate-spin" />
            </motion.div>
          ) : fetchedTokens.length > 0 ? (
            <motion.div
              key="fetched-tokens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col justify-start items-center w-full gap-2">
              {fetchedTokens.map((token) => (
                <NewfoundToken
                  disabled={isLimitReached}
                  token={token}
                  selectedTokens={selectedTokens}
                  setSelectedTokens={setSelectedTokens}
                />
              ))}
            </motion.div>
          ) : hasFetchedOnce ? (
            <motion.div
              key="no-tokens-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-[18px] font-bold">No tokens found</p>
            </motion.div>
          ) : (
            <motion.div
              key="start-typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-[18px] font-bold">
                Select a chain and start typing to search for new tokens
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Bottom modal buttons */}
      <div className="flex flex-col justify-center items-center w-full gap-5 mt-8">
        <NBButton
          key="confirm"
          className="w-full bg-accent"
          disabled={selectedTokens.length === 0}>
          <p className="text-[16px] text-white font-extrabold">Confirm</p>
        </NBButton>
        <button
          className="text-[16px] font-bold text-black cursor-pointer"
          onClick={handleModalOpen}>
          Cancel
        </button>
      </div>
    </NBModal>
  );
};
