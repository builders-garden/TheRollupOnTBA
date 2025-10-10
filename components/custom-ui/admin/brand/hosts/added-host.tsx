import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useDeleteHost, useHostsByBrandId } from "@/hooks/use-hosts";
import { Host } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";

interface AddedHostProps {
  host: Host;
  index: number;
  brandId?: string;
}

export const AddedHost = ({ host, index, brandId }: AddedHostProps) => {
  const { mutate: deleteHost } = useDeleteHost(AuthTokenType.ADMIN_AUTH_TOKEN);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the hosts by brand id
  const { refetch: refetchHosts } = useHostsByBrandId({
    brandId,
    enabled: !!brandId,
  });

  // Handles the deletion of the host from the list
  const handleDeleteHost = () => {
    if (!brandId) return;
    setIsDeleting(true);
    deleteHost(
      { brandId: host.brandId, fid: host.fid },
      {
        onSuccess: async () => {
          await refetchHosts();
          setIsDeleting(false);
        },
        onError: () => {
          setIsDeleting(false);
          toast.error("An error occurred while deleting the host");
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
      <NBCard key={host.fid} className="gap-3 bg-white">
        <Image
          src={host.avatarUrl || ""}
          alt={host.farcasterUsername || ""}
          priority
          width={256}
          height={256}
          className="size-[140px] aspect-square rounded-sm"
        />
        <div className="flex flex-col justify-start items-center gap-0.5">
          <p className="text-lg font-bold">{host.farcasterDisplayName}</p>
          <p className="text-sm opacity-50 font-bold">{host.fid.toString()}</p>
        </div>
        <NBButton
          className="w-full bg-destructive h-[42px]"
          onClick={handleDeleteHost}>
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
      </NBCard>
    </motion.div>
  );
};
