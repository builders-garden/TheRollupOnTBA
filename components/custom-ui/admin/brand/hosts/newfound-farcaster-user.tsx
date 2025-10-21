import { Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { useCreateHost, useHostsByBrandId } from "@/hooks/use-hosts";
import { AuthTokenType } from "@/lib/enums";
import { NeynarUser } from "@/lib/types/neynar.type";

interface NewfoundFarcasterUserProps {
  farcasterUser: NeynarUser;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  isCreatingHost: boolean;
  setIsCreatingHost: Dispatch<SetStateAction<boolean>>;
  handleResetModal: () => void;
  brandId?: string;
  index: number;
}

export const NewfoundFarcasterUser = ({
  farcasterUser,
  setIsModalOpen,
  isCreatingHost,
  setIsCreatingHost,
  handleResetModal,
  brandId,
  index,
}: NewfoundFarcasterUserProps) => {
  const [isCreatingFromThisUser, setIsCreatingFromThisUser] = useState(false);

  const { mutate: createHost } = useCreateHost(
    AuthTokenType.ADMIN_AUTH_TOKEN,
    brandId || "",
  );

  const { refetch: refetchHosts } = useHostsByBrandId({
    brandId,
    enabled: !!brandId,
  });

  // A function to handle the addition of a farcaster user as host
  const handleAddHost = (farcasterUser: NeynarUser) => {
    if (!brandId) return;
    setIsCreatingFromThisUser(true);
    setIsCreatingHost(true);
    const newHostData = {
      farcasterFid: farcasterUser.fid,
      brandId: brandId,
      farcasterUsername: farcasterUser.username,
      farcasterDisplayName: farcasterUser.display_name,
      farcasterAvatarUrl: farcasterUser.pfp_url,
      custodyAddress: farcasterUser.custody_address,
    };

    createHost(newHostData, {
      onSuccess: async () => {
        await refetchHosts();
        handleResetModal();
        setIsCreatingFromThisUser(false);
        setIsCreatingHost(false);
        setIsModalOpen(false);
        toast.success("Host added successfully");
      },
      onError: () => {
        toast.error("An error occurred while adding the host");
        setIsCreatingFromThisUser(false);
        setIsCreatingHost(false);
      },
    });
  };

  return (
    <motion.div
      key={farcasterUser.fid.toString()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: 0.1 * index, ease: "easeInOut" }}
      className="flex justify-between items-center w-full rounded-[12px] p-2.5 border-[1px] border-transparent">
      <div className="flex justify-start items-center gap-2.5">
        <Image
          src={farcasterUser.pfp_url || ""}
          alt={farcasterUser.fid.toString()}
          className="size-10 rounded-full"
          priority
          width={40}
          height={40}
        />
        <div className="flex flex-col justify-start items-start gap-0.5">
          <h1 className="text-lg font-bold">{farcasterUser.username}</h1>
          <p className="text-sm opacity-50 font-bold">
            {farcasterUser.fid.toString()}
          </p>
        </div>
      </div>
      <CTSButton
        onClick={() => {
          handleAddHost(farcasterUser);
        }}
        disabled={isCreatingHost}
        className="bg-accent h-[42px] w-[20%] shrink-0 gap-1.5">
        <AnimatePresence mode="wait">
          {isCreatingFromThisUser ? (
            <motion.div
              key="creating-host-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}>
              <Loader2 className="size-4 text-foreground animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="add-host-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex justify-center items-center gap-1.5">
              <Plus className="size-4 text-foreground" />
              <p className="text-sm text-foreground font-extrabold">Add Host</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CTSButton>
    </motion.div>
  );
};
