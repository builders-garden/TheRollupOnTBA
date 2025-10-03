import ky from "ky";
import { Loader2, Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAddress } from "viem/utils";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBModal } from "@/components/custom-ui/nb-modal";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useCreateFeaturedTokens } from "@/hooks/use-featured-tokens";
import { TokenNameToChainExplorerStringUrls } from "@/lib/constants";
import { FeaturedToken } from "@/lib/database/db.schema";
import { Token } from "@/lib/types/tokens.type";
import {
  cn,
  deepCompareDatabaseAndZerionTokens,
  deepCompareZerionTokens,
  getChainLogoUrl,
} from "@/lib/utils";
import { ChainSelector } from "./chain-selector";
import { NewfoundToken } from "./newfound-token";

interface TokensSearchModalProps {
  addedTokens: FeaturedToken[];
  disabled: boolean;
}

export const TokensSearchModal = ({
  addedTokens,
  disabled,
}: TokensSearchModalProps) => {
  const { brand, featuredTokens } = useAdminAuth();
  const { mutate: createFeaturedTokens } = useCreateFeaturedTokens();

  const [searchValue, setSearchValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChainName, setSelectedChainName] = useState<string>("base");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedTokens, setFetchedTokens] = useState<Token[]>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [fetchingError, setFetchingError] = useState<Error | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [isCreatingFeaturedTokens, setIsCreatingFeaturedTokens] =
    useState(false);

  // Debounce search value to avoid too frequent API calls
  const debouncedSearchValue = useDebounce(searchValue, 750);

  // Disabled state for the tokens
  const isLimitReached = addedTokens.length + selectedTokens.length >= 6;

  // When the search changes or the chain changes, fetch the new tokens
  useEffect(() => {
    const fetchTokens = async () => {
      setIsFetchingTokens(true);
      setFetchingError(null);
      setSelectedTokens([]);
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
          }>(`/api/tokens?chain_name=${selectedChainName}${searchParams}`)
          .json();

        if (tokens.success) {
          // Filter out tokens that are already added
          const cleanedTokens = tokens.data.filter(
            (token) =>
              !addedTokens.some((t) =>
                deepCompareDatabaseAndZerionTokens(t, token),
              ),
          );
          setFetchedTokens(cleanedTokens);
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

  // A function to handle the confirmation of the selected tokens
  const handleConfirm = () => {
    if (!brand.data || !brand.data.id) return;
    setIsCreatingFeaturedTokens(true);
    createFeaturedTokens(
      selectedTokens.map((token) => {
        const chainId = parseInt(token.chainId || "1");
        const chainLogoUrl = getChainLogoUrl(token.chainId || "1");
        const externalUrl =
          token.chainId && token.address
            ? `${TokenNameToChainExplorerStringUrls[token.chainId as keyof typeof TokenNameToChainExplorerStringUrls]}/token/${token.address}`
            : "";

        return {
          brandId: brand.data!.id,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals || 18,
          chainId: chainId,
          chainLogoUrl: chainLogoUrl,
          address: token.address || "",
          logoUrl: token.iconUrl || "",
          description: "",
          externalUrl: externalUrl,
          isActive: true,
        };
      }),
      {
        onSuccess: async () => {
          await featuredTokens.refetch();
          setIsCreatingFeaturedTokens(false);
          setIsModalOpen(false);
          setTimeout(() => {
            setFetchedTokens(
              fetchedTokens.filter(
                (fetchedToken) =>
                  !selectedTokens.some((selectedToken) =>
                    deepCompareZerionTokens(selectedToken, fetchedToken),
                  ),
              ),
            );
            setSelectedTokens([]);
          }, 300);
        },
        onError: () => {
          toast.error("An error occurred while adding the tokens");
          setIsCreatingFeaturedTokens(false);
        },
      },
    );
  };

  return (
    <NBModal
      trigger={
        <NBButton className="bg-accent w-[200px]" disabled={disabled}>
          <div className="flex justify-center items-center w-full gap-1.5 text-white">
            <Plus className="size-4.5" />
            <p className="text-base font-extrabold text-nowrap">
              Add more tokens
            </p>
          </div>
        </NBButton>
      }
      isOpen={isModalOpen}
      setIsOpen={setIsModalOpen}
      contentClassName="p-4 rounded-[12px] sm:max-w-2xl">
      <h1 className="text-2xl font-bold text-center">Search for a token</h1>

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
          <AnimatePresence mode="wait" initial={false}>
            {isEditing && (
              <motion.button
                key="x-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                onClick={() => {
                  setSearchValue("");
                }}
                className="cursor-pointer">
                <X className="size-5 shrink-0" />
              </motion.button>
            )}
          </AnimatePresence>
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-lg font-bold text-destructive">
                An error occurred, please try again later.
              </p>
            </motion.div>
          ) : isFetchingTokens ? (
            <motion.div
              key="fetching-tokens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <Loader2 className="size-8 text-black animate-spin" />
            </motion.div>
          ) : fetchedTokens.length > 0 ? (
            <motion.div
              key="fetched-tokens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col justify-start items-center w-full gap-2">
              {fetchedTokens.map((token, index) => (
                <NewfoundToken
                  key={index}
                  index={index}
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-lg font-bold">No tokens found</p>
            </motion.div>
          ) : (
            <motion.div
              key="start-typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-lg font-bold">
                Select a chain and start typing to search for new tokens
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Selected tokens count */}
      <div className="flex justify-end items-center w-full pb-2 pr-3 -mt-1">
        <p className="text-sm font-bold">
          Selected {selectedTokens.length}/{6 - addedTokens.length}
        </p>
      </div>

      {/* Bottom modal buttons */}
      <div className="flex flex-col justify-center items-center w-full gap-5">
        <NBButton
          key="confirm"
          className="w-full bg-accent h-[42px]"
          disabled={selectedTokens.length === 0 || isCreatingFeaturedTokens}
          onClick={handleConfirm}>
          <AnimatePresence mode="wait">
            {isCreatingFeaturedTokens ? (
              <motion.div
                key="creating-featured-tokens-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}>
                <Loader2 className="size-5 text-white animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="confirm-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}>
                <p className="text-base text-white font-extrabold">Confirm</p>
              </motion.div>
            )}
          </AnimatePresence>
        </NBButton>
        <button
          className="text-base font-bold text-black cursor-pointer"
          onClick={() => setIsModalOpen(false)}>
          Cancel
        </button>
      </div>
    </NBModal>
  );
};
