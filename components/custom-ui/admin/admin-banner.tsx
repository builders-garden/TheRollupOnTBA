import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { AdminPageContent } from "@/lib/enums";
import { capitalizeFirstLetter } from "@/lib/utils";

interface AdminBannerProps {
  selectedPageContent: AdminPageContent;
}

export const AdminBanner = ({ selectedPageContent }: AdminBannerProps) => {
  const { brand } = useAdminAuth();
  return (
    <div className="relative flex justify-center items-center w-full border-b-[1px] border-border">
      <Image
        src="/images/admin_page_banner.svg"
        alt="Admin page banner"
        width={106}
        height={73}
        priority
        className="h-auto w-full"
      />
      <AnimatePresence mode="wait">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          key={selectedPageContent}
          className="font-bold text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {capitalizeFirstLetter(selectedPageContent)}
        </motion.h1>
      </AnimatePresence>
      {brand.data?.id ? (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 border border-border rounded-md px-3 py-1 text-sm font-medium">
          <b>{brand.data.name}</b>
        </div>
      ) : null}
    </div>
  );
};
