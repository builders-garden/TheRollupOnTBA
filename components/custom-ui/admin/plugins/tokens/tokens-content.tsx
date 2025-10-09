import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { AddedToken } from "./added-token";
import { TokensSearchModal } from "./tokens-search-modal";

export const TokensContent = () => {
  const { featuredTokens } = useAdminAuth();
  const addedTokens = useMemo(() => featuredTokens.data, [featuredTokens]);

  // Disabled state for the add more tokens button
  const isAddMoreTokensDisabled = addedTokens.length >= 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-2xl">
        Feature up to 6 tokens during your livestream so viewers can trade them
        in real time.
      </h1>
      <div className="flex flex-col justify-start items-start w-full gap-5">
        <TokensSearchModal
          addedTokens={addedTokens}
          disabled={isAddMoreTokensDisabled}
        />
        <div className="flex flex-wrap gap-5 w-full">
          <AnimatePresence>
            {addedTokens.map((token, index) => (
              <AddedToken
                key={`${token.address}-${token.chainId}`}
                index={index}
                token={token}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
