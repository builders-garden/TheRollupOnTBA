import { Check, SquarePen, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CopyButton } from "@/components/custom-ui/copy-button";
import { NBButton } from "@/components/custom-ui/nb-button";

export const PayoutAddressInput = () => {
  const [payoutAddress, setPayoutAddress] = useState(
    "0x55a458f46e319F99e4983c70B179b316507F0d86",
  );
  const [editingPayoutAddress, setEditingPayoutAddress] =
    useState(payoutAddress);
  const [isEditing, setIsEditing] = useState(false);

  // Switches the editing state
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Handles the confirm button
  const handleConfirm = () => {
    setIsEditing(false);
    setPayoutAddress(editingPayoutAddress);
  };

  return (
    <div className="flex flex-col justify-start items-start gap-5 w-fit">
      <div className="flex justify-start items-center gap-2.5">
        <Wallet className="size-4" />
        <p className="text-[16px] font-bold">Payout Address</p>
      </div>
      <div className="flex w-fit justify-start items-center gap-5">
        {/* Input field */}
        <div className="flex w-[630px] justify-start items-center gap-2.5 rounded-full border-accent border-[1px] px-5 py-2.5 bg-white">
          <input
            type="text"
            disabled={!isEditing}
            className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-[20px] font-bold"
            value={editingPayoutAddress}
            onChange={(e) => {
              if (e.target.value.length > 41) {
                return;
              }
              setEditingPayoutAddress(e.target.value);
            }}
          />

          <AnimatePresence mode="wait">
            {!isEditing && (
              <motion.div
                key="not-editing-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex justify-center items-center gap-2.5">
                <CopyButton key="copy-button" stringToCopy={payoutAddress} />
                <motion.button
                  key={`SquarePen-button`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="cursor-pointer shrink-0"
                  onClick={handleEdit}>
                  <SquarePen className="size-6 text-success" />
                </motion.button>
              </motion.div>
            )}
            {isEditing && (
              <motion.div
                key="editing-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex justify-center items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer shrink-0"
                  onClick={() => setEditingPayoutAddress("")}>
                  <X className="size-6 text-black" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer shrink-0"
                  onClick={handleConfirm}>
                  <Check className="size-6 text-success" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connected wallet button */}
        <AnimatePresence mode="wait">
          {isEditing && (
            <motion.div
              key={`Set-to-connected-account-button`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              <NBButton
                className="bg-success w-fit shrink-0"
                onClick={() => setEditingPayoutAddress("pippo.base.eth")}>
                <p className="text-[16px] font-extrabold text-white">
                  Set to connected account (pippo.base.eth)
                </p>
              </NBButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
