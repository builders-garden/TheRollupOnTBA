import { motion } from "motion/react";
import { TokensSearchModal } from "./tokens-search-modal";

export const TokensContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-[24px]">
        Feature up to 6 tokens during your livestream so viewers can trade them
        in real time.
      </h1>
      <div className="flex flex-col justify-start items-start w-full gap-2.5">
        <TokensSearchModal />
      </div>
    </motion.div>
  );
};
