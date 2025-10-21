import { Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
    <div className="flex justify-between items-center w-full h-[73px]">
      <AnimatePresence mode="wait">
        <motion.h1
          key={selectedPageContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="font-bold text-4xl">
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
          className="flex justify-center items-center gap-1.5 bg-foreground text-background border border-border rounded-md px-3 py-1 text-[16px] font-medium cursor-pointer">
          <p>
            Miniapp URL: {env.NEXT_PUBLIC_URL}/<b>{brand.data.slug}</b>
          </p>
          <Copy className="size-4" />
        </motion.button>
      ) : null}
    </div>
  );
};
