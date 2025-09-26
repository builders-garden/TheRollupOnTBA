import { Check, Copy, Loader2, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Address, isAddress } from "viem";
import { NBButton } from "@/components/custom-ui/nb-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import {
  useAdminsByBrandId,
  useCreateAdmin,
  useDeleteAdmin,
} from "@/hooks/use-admins";
import {
  getAddressFromBaseName,
  getAddressFromEnsName,
  getBasenameName,
  getEnsName,
} from "@/lib/ens/client";
import { copyToClipboard } from "@/lib/utils";
import { NBTextInput } from "../info/nb-text-input";

export const AccessContent = () => {
  const [textInputValue, setTextInputValue] = useState("");
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [addressInDeletion, setAddressInDeletion] = useState<string | null>(
    null,
  );

  const { brand, admin: connectedAdmin } = useAdminAuth();
  const brandId = useMemo(() => brand.data?.id, [brand.data?.id]);
  const { mutate: createAdmin, isPending: isCreatingAdmin } = useCreateAdmin();
  const { mutate: deleteAdmin, isPending: isDeletingAdmin } = useDeleteAdmin();
  const {
    data: admins,
    isLoading: isLoadingAdmins,
    refetch: refetchAdmins,
  } = useAdminsByBrandId({
    brandId,
    enabled: !!brandId,
  });

  // Handles the copy button
  const handleCopy = (stringToCopy: string) => {
    setIsCopying(true);
    setTimeout(() => {
      copyToClipboard(stringToCopy);
      setIsCopying(false);
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 1000);
    }, 1500);
  };

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

    if (
      !brandId ||
      isCreatingAdmin ||
      isDeletingAdmin ||
      isLoadingAdmins ||
      textData === ""
    )
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

  // Handles the remove button
  const handleRemove = (address: string) => {
    if (
      isDeletingAdmin ||
      isCreatingAdmin ||
      isCopying ||
      hasCopied ||
      isUpdatingAdmin
    )
      return;
    setAddressInDeletion(address);
    deleteAdmin(
      { address },
      {
        onSuccess: async () => {
          await refetchAdmins();
          toast.success("Admin removed successfully");
          setAddressInDeletion(null);
        },
        onError: () => {
          toast.error("Error while removing admin");
          setAddressInDeletion(null);
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

            <h1 className="font-bold text-xl mt-6">Current Admins</h1>
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Base Name</TableHead>
                  <TableHead>ENS Name</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody className="font-bold text-lg">
                {admins?.data?.map((admin, index) => (
                  <TableRow key={admin.address}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{admin.address}</TableCell>
                    <TableCell>{admin.baseName}</TableCell>
                    <TableCell>{admin.ensName}</TableCell>
                    <TableCell className="flex items-center justify-center gap-3.5">
                      <NBButton
                        disabled={isCopying || hasCopied}
                        onClick={() => {
                          if (isCopying || hasCopied) return;
                          handleCopy(admin.address);
                        }}
                        className="bg-accent w-fit h-[42px]">
                        <AnimatePresence mode="wait">
                          {isCopying && (
                            <motion.div
                              key="loader"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: 0.15,
                                ease: "easeInOut",
                              }}>
                              <Loader2 className="size-5 text-white animate-spin" />
                            </motion.div>
                          )}
                          {hasCopied && (
                            <motion.div
                              key="check"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: 0.15,
                                ease: "easeInOut",
                              }}>
                              <Check className="size-5 text-white" />
                            </motion.div>
                          )}
                          {!isCopying && !hasCopied && (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: 0.15,
                                ease: "easeInOut",
                              }}>
                              <Copy className="size-5 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </NBButton>
                      {admin.address.toLowerCase() !==
                      connectedAdmin.address?.toLowerCase() ? (
                        <NBButton
                          onClick={() => handleRemove(admin.address)}
                          disabled={
                            isDeletingAdmin ||
                            isCreatingAdmin ||
                            isCopying ||
                            hasCopied
                          }
                          className="bg-destructive h-[42px] w-[100px]">
                          <AnimatePresence mode="wait">
                            {isDeletingAdmin &&
                            addressInDeletion === admin.address ? (
                              <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}>
                                <Loader2 className="size-5 text-white animate-spin" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="remove"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-base font-extrabold text-white">
                                Remove
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </NBButton>
                      ) : (
                        <p className="text-base font-extrabold text-center text-black/50 w-[100px]">
                          Main Admin
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
