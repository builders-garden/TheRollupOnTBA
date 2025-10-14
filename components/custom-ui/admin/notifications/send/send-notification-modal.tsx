import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBModal } from "@/components/custom-ui/nb-modal";
import { useCreateBrandNotification } from "@/hooks/use-brand-notifications";
import { useSendBrandNotification } from "@/hooks/use-send-notification";
import { Brand } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { env } from "@/lib/zod";

interface SendNotificationModalProps {
  notificationTitle: string;
  notificationBody: string;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  brand?: Brand;
  totalTargetUsers: number;
}

export const SendNotificationModal = ({
  notificationTitle,
  notificationBody,
  isModalOpen,
  setIsModalOpen,
  brand,
  totalTargetUsers,
}: SendNotificationModalProps) => {
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Create the target url
  const targetUrl = brand ? `${env.NEXT_PUBLIC_URL}/${brand.slug}` : "";

  // Mutation to send the notification
  const { mutate: sendNotification } = useSendBrandNotification(
    AuthTokenType.ADMIN_AUTH_TOKEN,
    brand?.id ?? "",
  );

  // Mutation to create the notification record for this brand
  const { mutate: createNotification } = useCreateBrandNotification(
    AuthTokenType.ADMIN_AUTH_TOKEN,
    brand?.id ?? "",
  );

  const handleSendNotifications = () => {
    if (!brand || !targetUrl) {
      toast.error("Brand or target url not found");
      return;
    }

    setIsSendingNotification(true);
    sendNotification(
      {
        title: notificationTitle,
        body: notificationBody,
        targetUrl,
      },
      {
        onSuccess: () => {
          createNotification(
            {
              title: notificationTitle,
              body: notificationBody,
              targetUrl,
              totalTargetUsers,
            },
            {
              onSuccess: () => {
                toast.success("Notification added to history");
                setIsModalOpen(false);
                setIsSendingNotification(false);
              },
              onError: () => {
                console.log("Error while creating notification history record");
                setIsModalOpen(false);
                setIsSendingNotification(false);
              },
            },
          );
          toast.success("Notifications sent successfully");
        },
        onError: () => {
          toast.error("Error while sending notifications");
          setIsSendingNotification(false);
        },
      },
    );
  };

  return (
    <NBModal
      trigger={
        <NBButton
          className="w-fit px-5 bg-accent h-[42px]"
          disabled={isSendingNotification}>
          <p className="text-base font-extrabold text-white">
            Send Notifications
          </p>
        </NBButton>
      }
      isOpen={isModalOpen}
      setIsOpen={setIsModalOpen}
      contentClassName="p-4 sm:p-6 rounded-[12px] sm:max-w-2xl">
      <h1 className="text-2xl font-bold text-center">
        Confirm sending the following notification
      </h1>

      <div className="flex justify-start items-center w-full px-3 py-7 gap-4">
        {brand?.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt="brand logo"
            width={100}
            height={100}
            className="size-16 object-contain rounded-[12px] shrink-0"
          />
        ) : (
          <div className="flex justify-center items-center size-16 bg-black/10 rounded-[12px] shrink-0">
            <p className="text-5xl font-bold text-center text-black/60">
              {brand?.name?.slice(0, 1).toUpperCase() || ""}
            </p>
          </div>
        )}
        <div className="flex flex-col justify-start items-start w-full gap-1.5">
          <p className="text-xl font-bold">{notificationTitle}</p>
          <p className="text-xl text-muted-foreground leading-6">
            {notificationBody}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-5">
        <NBButton
          key="confirm"
          onClick={handleSendNotifications}
          disabled={isSendingNotification}
          className="w-full bg-accent h-[42px]">
          <AnimatePresence mode="wait">
            {isSendingNotification ? (
              <motion.div
                key="sending-notifications-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}>
                <Loader2 className="size-5 text-white animate-spin" />
              </motion.div>
            ) : (
              <motion.p
                key="sending-notifications-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="text-base font-extrabold text-white">
                Send Notification
              </motion.p>
            )}
          </AnimatePresence>
        </NBButton>

        <button
          className="text-base font-bold text-black cursor-pointer"
          onClick={() => setIsModalOpen(false)}>
          Cancel
        </button>
      </div>
    </NBModal>
  );
};
