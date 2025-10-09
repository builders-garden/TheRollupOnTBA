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
import { useCreateHost } from "@/hooks/use-hosts";
import { Host } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { NeynarUser } from "@/lib/types/neynar.type";
import { cn, deepCompareZerionTokens, getChainLogoUrl } from "@/lib/utils";
import { NewfoundFarcasterUser } from "./newfound-farcaster-user";

interface HostsSearchModalProps {
  addedHosts: Host[];
  disabled: boolean;
}

export const HostsSearchModal = ({
  addedHosts,
  disabled,
}: HostsSearchModalProps) => {
  const { brand } = useAdminAuth();

  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedFarcasterUsers, setFetchedFarcasterUsers] = useState<
    NeynarUser[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingFarcasterUsers, setIsFetchingFarcasterUsers] =
    useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [fetchingError, setFetchingError] = useState<Error | null>(null);
  const [isCreatingHost, setIsCreatingHost] = useState(false);

  // Debounce search value to avoid too frequent API calls
  const debouncedSearchValue = useDebounce(searchValue, 750);

  // When the search changes or the chain changes, fetch the new hosts
  useEffect(() => {
    const fetchFarcasterUsers = async () => {
      if (!brand.data || !brand.data.id || !debouncedSearchValue) return;
      setIsFetchingFarcasterUsers(true);
      setFetchingError(null);
      try {
        const response = await ky
          .get<{
            users: NeynarUser[];
          }>("/api/farcaster-users?username=" + debouncedSearchValue)
          .json();

        if (response.users.length > 0) {
          // Filter out farcaster users that are already added as hosts
          const cleanedFarcasterUsers = response.users.filter(
            (farcasterUser) =>
              !addedHosts.some((host) => host.fid === farcasterUser.fid),
          );
          setFetchedFarcasterUsers(cleanedFarcasterUsers);
        }
      } catch (error) {
        console.error("Error fetching farcaster users", error);
        setFetchingError(error as Error);
      } finally {
        setIsFetchingFarcasterUsers(false);
        setHasFetchedOnce(true);
      }
    };

    fetchFarcasterUsers();
  }, [debouncedSearchValue]);

  // Handles the reset of the modal
  const handleResetModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSearchValue("");
      setIsCreatingHost(false);
      setFetchedFarcasterUsers([]);
      setIsEditing(false);
    }, 300);
  };

  return (
    <NBModal
      trigger={
        <NBButton className="bg-accent w-[200px]" disabled={disabled}>
          <div className="flex justify-center items-center w-full gap-1.5 text-white">
            <Plus className="size-4.5" />
            <p className="text-base font-extrabold text-nowrap">
              Add more hosts
            </p>
          </div>
        </NBButton>
      }
      isOpen={isModalOpen}
      setIsOpen={setIsModalOpen}
      contentClassName="p-4 rounded-[12px] sm:max-w-2xl">
      <h1 className="text-2xl font-bold text-center">Search for a user</h1>

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
            placeholder="Search for a farcaster user by its username"
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
      </div>

      {/* Found farcaster users list */}
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
          ) : isFetchingFarcasterUsers ? (
            <motion.div
              key="fetching-farcaster-users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <Loader2 className="size-8 text-black animate-spin" />
            </motion.div>
          ) : fetchedFarcasterUsers.length > 0 ? (
            <motion.div
              key="fetched-farcaster-users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col justify-start items-center w-full gap-2">
              {fetchedFarcasterUsers.map((farcasterUser, index) => (
                <NewfoundFarcasterUser
                  key={index}
                  index={index}
                  brandId={brand.data?.id}
                  isCreatingHost={isCreatingHost}
                  setIsModalOpen={setIsModalOpen}
                  setIsCreatingHost={setIsCreatingHost}
                  handleResetModal={handleResetModal}
                  farcasterUser={farcasterUser}
                />
              ))}
            </motion.div>
          ) : hasFetchedOnce ? (
            <motion.div
              key="no-farcaster-users-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-lg font-bold">No farcaster users found</p>
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
                Start typing to search for new farcaster users
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Bottom modal buttons */}
      <div className="flex flex-col justify-center items-center w-full gap-5">
        <button
          className="text-base font-bold text-black cursor-pointer"
          onClick={() => setIsModalOpen(false)}>
          Cancel
        </button>
      </div>
    </NBModal>
  );
};
