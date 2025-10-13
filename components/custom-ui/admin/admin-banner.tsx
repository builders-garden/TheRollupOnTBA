import { Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { AdminPageContent } from "@/lib/enums";
import { capitalizeFirstLetter, copyToClipboard } from "@/lib/utils";
import { env } from "@/lib/zod";

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
          transition={{ duration: 0.2, ease: "easeInOut" }}
          key={selectedPageContent}
          className="font-bold text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {capitalizeFirstLetter(selectedPageContent)}
        </motion.h1>
      </AnimatePresence>
      {brand.data?.id ? (
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={() => {
            copyToClipboard(env.NEXT_PUBLIC_URL + "/" + brand.data?.slug);
          }}
          className="absolute flex justify-center items-center gap-1.5 right-6 top-1/2 -translate-y-1/2 bg-white/90 border border-border rounded-md px-3 py-1 text-[16px] font-medium cursor-pointer">
          <p>
            Miniapp URL: {env.NEXT_PUBLIC_URL}/<b>{brand.data.slug}</b>
          </p>
          <Copy className="size-4" />
        </motion.button>
      ) : null}
    </div>
  );
};
