import { Check, SquarePen, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Address, isAddress } from "viem";
import { CopyButton } from "@/components/custom-ui/copy-button";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useUpdateTipSettings } from "@/hooks/use-tip-settings";
import {
  getAddressFromBaseName,
  getAddressFromEnsName,
  getBasenameName,
  getEnsName,
} from "@/lib/ens/client";
import { AuthTokenType } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const PayoutAddressInput = () => {
  const { tipSettings, admin } = useAdminAuth();
  const { mutate: updateTip } = useUpdateTipSettings(
    AuthTokenType.ADMIN_AUTH_TOKEN,
  );

  const [textFieldValue, setTextFieldValue] = useState(
    tipSettings?.data?.payoutBaseName ||
      tipSettings?.data?.payoutEnsName ||
      tipSettings?.data?.payoutAddress ||
      "",
  );
  const [editingTextFieldValue, setEditingTextFieldValue] =
    useState(textFieldValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Whether the input text is an address
  const isPayoutAddressAnAddress = isAddress(editingTextFieldValue);

  // Whether the input text is an ENS name
  const isPayoutAddressAnEnsName = editingTextFieldValue.endsWith(".eth");

  // Whether the input text is a Base name
  const isPayoutAddressABaseName = editingTextFieldValue.endsWith(".base.eth");

  // Handles the activation of the input
  const handleActivateEditing = () => {
    if (isUpdating) return;
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Handle the cancel button
  const handleCancel = () => {
    setIsEditing(false);
    setTextFieldValue(textFieldValue);
    setEditingTextFieldValue(textFieldValue);
  };

  // Handles the confirm button
  const handleConfirm = async () => {
    if (editingTextFieldValue === textFieldValue) {
      setIsEditing(false);
      return;
    }
    if (
      !isPayoutAddressAnAddress &&
      !isPayoutAddressABaseName &&
      !isPayoutAddressAnEnsName
    ) {
      toast.error("Invalid payout address");
      return;
    }

    setIsUpdating(true);
    if (tipSettings?.data?.id) {
      let payoutAddress = isPayoutAddressAnAddress
        ? editingTextFieldValue
        : undefined;
      let payoutBaseName = isPayoutAddressABaseName
        ? editingTextFieldValue
        : undefined;
      let payoutEnsName = isPayoutAddressAnEnsName
        ? editingTextFieldValue
        : undefined;

      if (isPayoutAddressAnAddress) {
        payoutBaseName = (await getBasenameName(editingTextFieldValue)) || "";
        payoutEnsName = (await getEnsName(editingTextFieldValue)) || "";
      } else if (isPayoutAddressABaseName) {
        payoutAddress = (await getAddressFromBaseName(
          editingTextFieldValue,
        )) as Address;
        // If there is no payout address associated with the Base name, return
        if (!payoutAddress) {
          toast.error("Invalid Base name");
          setIsUpdating(false);
          return;
        }
        payoutEnsName = (await getEnsName(payoutAddress)) || "";
      } else if (isPayoutAddressAnEnsName) {
        payoutAddress = (await getAddressFromEnsName(
          editingTextFieldValue,
        )) as Address;
        // If there is no payout address associated with the ENS name, return
        if (!payoutAddress) {
          toast.error("Invalid ENS name");
          setIsUpdating(false);
          return;
        }
        payoutBaseName = (await getBasenameName(payoutAddress)) || "";
      }

      updateTip(
        {
          tipId: tipSettings?.data?.id,
          payoutAddress,
          payoutBaseName,
          payoutEnsName,
        },
        {
          onSuccess: async () => {
            setIsEditing(false);
            setIsUpdating(false);
            setTextFieldValue(editingTextFieldValue);
            await tipSettings.refetch();
            toast.success("Payout address updated successfully");
          },
          onError: () => {
            setIsEditing(false);
            setIsUpdating(false);
            toast.error("Error while updating payout address");
          },
        },
      );
    }
  };

  return (
    <div className="flex flex-col justify-start items-start gap-5 w-fit">
      <div className="flex justify-start items-center gap-2.5">
        <Wallet className="size-5" />
        <p className="text-base font-bold">Payout Address</p>
      </div>
      <div className="flex w-fit justify-start items-center gap-5">
        {/* Input field */}
        <div className="flex w-[630px] justify-start items-center gap-2.5 rounded-full border-accent border-[1px] px-5 py-2.5 bg-white">
          <input
            type="text"
            className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-xl font-bold"
            value={editingTextFieldValue}
            onFocus={handleActivateEditing}
            onChange={(e) => {
              if (e.target.value.length > 42) {
                return;
              }
              setEditingTextFieldValue(e.target.value);
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
                <CopyButton key="copy-button" stringToCopy={textFieldValue} />
                <motion.button
                  key={`SquarePen-button`}
                  disabled={isUpdating}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                  whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className={cn(
                    "cursor-pointer shrink-0",
                    isUpdating && "animate-pulse cursor-default",
                  )}
                  onClick={handleActivateEditing}>
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
                  disabled={isUpdating}
                  whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                  whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                  className={cn(
                    "cursor-pointer shrink-0",
                    isUpdating && "animate-pulse cursor-default",
                  )}
                  onClick={handleCancel}>
                  <X className="size-6 text-black" />
                </motion.button>
                <motion.button
                  disabled={isUpdating}
                  whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                  whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                  className={cn(
                    "cursor-pointer shrink-0",
                    isUpdating && "animate-pulse cursor-default",
                  )}
                  onClick={handleConfirm}>
                  <Check className="size-6 text-success" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connected wallet button */}
        <AnimatePresence mode="wait">
          {isEditing && admin.baseName && (
            <motion.div
              key={`Set-to-connected-account-button`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}>
              <CTSButton
                className="bg-success w-fit shrink-0"
                disabled={isUpdating}
                onClick={() => setEditingTextFieldValue(admin.baseName || "")}>
                <p className="text-base font-extrabold text-foreground">
                  Set to connected account ({admin.baseName})
                </p>
              </CTSButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
