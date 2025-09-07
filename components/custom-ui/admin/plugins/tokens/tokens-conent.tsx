import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Token } from "@/lib/types/tokens.type";
import { AddedToken } from "./added-token";
import { TokensSearchModal } from "./tokens-search-modal";

export const TokensContent = () => {
  const [addedTokens, setAddedTokens] = useState<Token[]>([]);

  // Disabled state for the add more tokens button
  const isAddMoreTokensDisabled = addedTokens.length >= 6;

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
      <div className="flex flex-col justify-start items-start w-full gap-5">
        <TokensSearchModal
          addedTokens={addedTokens}
          setAddedTokens={setAddedTokens}
          disabled={isAddMoreTokensDisabled}
        />
        <div className="flex flex-wrap gap-5 w-full">
          <AnimatePresence>
            {addedTokens.map((token, index) => (
              <AddedToken
                key={`${token.address}-${token.chainId}`}
                index={index}
                token={token}
                addedTokens={addedTokens}
                setAddedTokens={setAddedTokens}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
