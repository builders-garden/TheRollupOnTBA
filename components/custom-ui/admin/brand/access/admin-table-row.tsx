import { Check, Copy, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { TableCell, TableRow } from "@/components/shadcn-ui/table";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useAdminsByBrandId, useDeleteAdmin } from "@/hooks/use-admins";
import { Admin } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { copyToClipboard } from "@/lib/utils";

interface AdminTableRowProps {
  admin: Admin;
  index: number;
  isCreatingAdmin: boolean;
  isUpdatingAdmin: boolean;
  isLastAdmin: boolean;
}

export const AdminTableRow = ({
  admin,
  index,
  isCreatingAdmin,
  isUpdatingAdmin,
  isLastAdmin,
}: AdminTableRowProps) => {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const { brand, admin: connectedAdmin } = useAdminAuth();
  const { mutate: deleteAdmin, isPending: isDeletingAdmin } = useDeleteAdmin(
    AuthTokenType.ADMIN_AUTH_TOKEN,
  );
  const { refetch: refetchAdmins } = useAdminsByBrandId({
    brandId: brand.data?.id,
    enabled: !!brand.data?.id,
    tokenType: AuthTokenType.ADMIN_AUTH_TOKEN,
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

  // Handles the remove button
  const handleRemove = (address: string) => {
    if (
      isDeletingAdmin ||
      isCreatingAdmin ||
      isCopying ||
      hasCopied ||
      isUpdatingAdmin ||
      !brand.data?.id
    )
      return;

    // If there is only one admin, return an error
    if (isLastAdmin) {
      toast.error("Cannot delete the last admin");
      return;
    }

    deleteAdmin(
      { brandId: brand.data.id, address },
      {
        onSuccess: async () => {
          await refetchAdmins();
          toast.success("Admin removed successfully");
        },
        onError: () => {
          toast.error("Error while removing admin");
        },
      },
    );
  };

  return (
    <TableRow key={admin.address} className="border-border hover:bg-muted/10">
      <TableCell>{index + 1}</TableCell>
      <TableCell>{admin.address}</TableCell>
      <TableCell>{admin.baseName}</TableCell>
      <TableCell>{admin.ensName}</TableCell>
      <TableCell className="flex items-center justify-center gap-3.5">
        <CTSButton
          disabled={isCopying || hasCopied}
          onClick={() => {
            if (isCopying || hasCopied) return;
            handleCopy(admin.address);
          }}
          className="w-fit h-[42px]">
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
                <Loader2 className="size-5 text-background animate-spin" />
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
                <Check className="size-5 text-background" />
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
                <Copy className="size-5 text-background" />
              </motion.div>
            )}
          </AnimatePresence>
        </CTSButton>
        {admin.address.toLowerCase() !==
          connectedAdmin.address?.toLowerCase() && (
          <CTSButton
            onClick={() => handleRemove(admin.address)}
            disabled={
              isDeletingAdmin || isCreatingAdmin || isCopying || hasCopied
            }
            className="h-[42px] w-[100px]"
            variant="destructive">
            <AnimatePresence mode="wait">
              {isDeletingAdmin ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}>
                  <Loader2 className="size-5 text-foreground animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="remove"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-base font-extrabold text-foreground">
                  Remove
                </motion.div>
              )}
            </AnimatePresence>
          </CTSButton>
        )}
      </TableCell>
    </TableRow>
  );
};
