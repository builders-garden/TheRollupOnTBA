import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useHostsByBrandId } from "@/hooks/use-hosts";
import { AddedHost } from "./added-host";
import { HostsSearchModal } from "./hosts-search-modal";

export const HostsContent = () => {
  const { brand } = useAdminAuth();
  const brandId = useMemo(() => brand.data?.id, [brand.data?.id]);

  // Get the hosts by brand id
  const { data: hosts, isLoading: isLoadingHosts } = useHostsByBrandId({
    brandId,
    enabled: !!brandId,
  });

  // Disabled state for the hosts search modal
  const disabledModalButton =
    isLoadingHosts || (!!hosts?.data?.length && hosts.data.length >= 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <AnimatePresence mode="wait">
        {isLoadingHosts ? (
          <motion.div
            key="loading-hosts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex justify-center items-center w-full h-[256px]">
            <Loader2 className="size-10 text-black animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="hosts-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex flex-col justify-start items-start w-full h-full gap-5">
            <h1 className="font-bold text-2xl">
              Select up to 5 hosts that will show up in the stream description
              section
            </h1>
            <div className="flex flex-col gap-2.5 w-1/2">
              <HostsSearchModal
                addedHosts={hosts?.data || []}
                disabled={disabledModalButton}
              />
            </div>

            <div className="flex justify-start items-center gap-2.5 w-full">
              {hosts?.data?.length &&
                hosts.data.map((host, index) => (
                  <AddedHost
                    key={host.fid}
                    host={host}
                    index={index}
                    brandId={brandId}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
