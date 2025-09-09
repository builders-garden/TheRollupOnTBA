import { motion } from "motion/react";
import { PayoutAddressInput } from "./payout-address-input";

export const TipsContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-2xl">
        Enable viewers to send you tips during your livestream, paid directly to
        your wallet.
      </h1>
      {/* Payout Address */}
      <PayoutAddressInput />
    </motion.div>
  );
};
