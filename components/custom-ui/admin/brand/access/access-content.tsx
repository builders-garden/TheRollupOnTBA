import { Loader2, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Address, isAddress } from "viem";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useAdminsByBrandId, useCreateAdmin } from "@/hooks/use-admins";
import {
  getAddressFromBaseName,
  getAddressFromEnsName,
  getBasenameName,
  getEnsName,
} from "@/lib/ens/client";
import { NBTextInput } from "../info/nb-text-input";
import { AdminsTable } from "./admins-table";

export const AccessContent = () => {
  const [textInputValue, setTextInputValue] = useState("");
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  const { brand } = useAdminAuth();
  const brandId = useMemo(() => brand.data?.id, [brand.data?.id]);
  const { mutate: createAdmin, isPending: isCreatingAdmin } = useCreateAdmin();
  const {
    data: admins,
    isLoading: isLoadingAdmins,
    refetch: refetchAdmins,
  } = useAdminsByBrandId({
    brandId,
    enabled: !!brandId,
  });

  // Handles the confirm button
  const handleConfirm = async (
    textData: string,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    // If the admin already exists, return
    if (
      admins?.data?.some(
        (admin) =>
          admin.address === textData ||
          admin.baseName === textData ||
          admin.ensName === textData,
      )
    ) {
      toast.error("Admin already exists");
      onError?.();
      setTextInputValue("");
      return;
    }

    if (!brandId || isCreatingAdmin || isLoadingAdmins || textData === "")
      return;

    setIsUpdatingAdmin(true);

    // Whether the input text is an address
    const isTextInputAnAddress = isAddress(textData);

    // Whether the input text is an ENS name
    const isTextInputAnEnsName = textData.endsWith(".eth");

    // Whether the input text is a Base name
    const isTextInputABaseName = textData.endsWith(".base.eth");

    if (
      !isTextInputAnAddress &&
      !isTextInputABaseName &&
      !isTextInputAnEnsName
    ) {
      toast.error("Invalid admin address or name");
      setIsUpdatingAdmin(false);
      return;
    }

    let adminAddress = isTextInputAnAddress ? textData : undefined;
    let adminBaseName = isTextInputABaseName ? textData : undefined;
    let adminEnsName = isTextInputAnEnsName ? textData : undefined;

    if (isTextInputAnAddress) {
      adminBaseName = (await getBasenameName(textData)) || "";
      adminEnsName = (await getEnsName(textData)) || "";
    } else if (isTextInputABaseName) {
      adminAddress = (await getAddressFromBaseName(textData)) as Address;
      // If there is no payout address associated with the Base name, return
      if (!adminAddress) {
        toast.error("Invalid Base name");
        setIsUpdatingAdmin(false);
        return;
      }
      adminEnsName = (await getEnsName(adminAddress)) || "";
    } else if (isTextInputAnEnsName) {
      adminAddress = (await getAddressFromEnsName(textData)) as Address;
      // If there is no payout address associated with the ENS name, return
      if (!adminAddress) {
        toast.error("Invalid ENS name");
        setIsUpdatingAdmin(false);
        return;
      }
      adminBaseName = (await getBasenameName(adminAddress)) || "";
    }

    createAdmin(
      {
        address: adminAddress!,
        baseName: adminBaseName,
        ensName: adminEnsName,
        brandId: brandId,
      },
      {
        onSuccess: async () => {
          await refetchAdmins();
          toast.success("Admin added successfully");
          setTextInputValue("");
          setIsUpdatingAdmin(false);
          onSuccess?.();
        },
        onError: () => {
          toast.error("Error while adding admin");
          setTextInputValue("");
          setIsUpdatingAdmin(false);
          onError?.();
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <AnimatePresence mode="wait">
        {isLoadingAdmins ? (
          <motion.div
            key="loading-admins"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex justify-center items-center w-full h-[256px]">
            <Loader2 className="size-10 text-black animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="admins-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex flex-col justify-start items-start w-full h-full gap-5">
            <h1 className="font-bold text-2xl">
              Select the admins that can access and edit your brand
            </h1>
            <div className="flex flex-col gap-2.5 w-1/2">
              <NBTextInput
                label="New Admin"
                icon={<Wallet className="size-5" />}
                placeholder="Add an address or a Base name..."
                value={textInputValue}
                setValue={setTextInputValue}
                onConfirm={handleConfirm}
                isUpdating={isCreatingAdmin || isUpdatingAdmin}
                resetValueAfterConfirm
              />
            </div>
            <AdminsTable
              admins={admins?.data || []}
              isCreatingAdmin={isCreatingAdmin}
              isUpdatingAdmin={isUpdatingAdmin}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
