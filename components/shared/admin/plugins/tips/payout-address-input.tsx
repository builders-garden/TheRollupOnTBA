import { Copy, SquarePen, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NBButton } from "@/components/shared/nb-button";

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

  // Handles the cancel button
  const handleCancel = () => {
    setIsEditing(false);
    setEditingPayoutAddress(payoutAddress);
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
              <motion.button
                key={`Copy-button`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="cursor-pointer shrink-0">
                <Copy className="size-6 text-accent" />
              </motion.button>
            )}
            {!isEditing && (
              <motion.button
                key={`SquarePen-button`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="cursor-pointer shrink-0"
                onClick={handleEdit}>
                <SquarePen className="size-6 text-success" />
              </motion.button>
            )}
            {isEditing && (
              <motion.button
                key={`X-button`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer shrink-0"
                onClick={() => setEditingPayoutAddress("")}>
                <X className="size-6 text-black" />
              </motion.button>
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
              exit={{
                opacity: 0,
                transition: {
                  delay: 0.3,
                },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              <NBButton className="bg-success w-fit shrink-0">
                <p className="text-[16px] font-extrabold text-white">
                  Set to connected account (pippo.base.eth)
                </p>
              </NBButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm and Cancel buttons */}
      <AnimatePresence mode="wait">
        {isEditing && (
          <motion.div
            key={`Confirm-Cancel-buttons`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                delay: 0.3,
              },
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex justify-start items-center gap-2.5 w-full">
            <NBButton className="bg-white w-[50%]" onClick={handleCancel}>
              <p className="text-[16px] font-extrabold text-destructive">
                Cancel
              </p>
            </NBButton>
            <NBButton className="bg-accent w-[50%]" onClick={handleConfirm}>
              <p className="text-[16px] font-extrabold text-white">Confirm</p>
            </NBButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
