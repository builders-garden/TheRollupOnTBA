import { Loader2, PencilLine, Text } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useNotificationSubscriptionsAmount } from "@/hooks/use-notification-subscriptions";
import { AuthTokenType } from "@/lib/enums";
import { CTSTextInput } from "../../brand/info/cts-text-input";
import { SendNotificationModal } from "./send-notification-modal";

export const SendContent = () => {
  const { brand } = useAdminAuth();

  const [notificationTitle, setNotificationTitle] = useState(
    localStorage.getItem("cts-notificationTitle") || "",
  );
  const [notificationBody, setNotificationBody] = useState(
    localStorage.getItem("cts-notificationBody") || "",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get the total number of notification subscriptions for the brand
  const {
    data: subscriptionsCount,
    isLoading: isCountingSubscriptions,
    error: errorCountingSubscriptions,
  } = useNotificationSubscriptionsAmount({
    tokenType: AuthTokenType.ADMIN_AUTH_TOKEN,
    enabled: !!brand.data?.id,
    brandId: brand.data?.id,
  });

  // The number of users that are subscribed to the brand for notifications
  const usersCount = useMemo(
    () => subscriptionsCount?.data,
    [subscriptionsCount?.data],
  );

  // Debounce the notification title and body
  const debouncedNotificationTitle = useDebounce(notificationTitle, 1000);
  const debouncedNotificationBody = useDebounce(notificationBody, 1000);

  // When the debounced notification title or body changes, set them in the local storage
  useEffect(() => {
    localStorage.setItem("cts-notificationTitle", debouncedNotificationTitle);
    localStorage.setItem("cts-notificationBody", debouncedNotificationBody);
  }, [debouncedNotificationTitle, debouncedNotificationBody]);

  return (
    <AnimatePresence mode="wait">
      {isCountingSubscriptions ? (
        <motion.div
          key="loading-tips-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex justify-center items-center w-full h-[256px]">
          <Loader2 className="size-10 text-black animate-spin" />
        </motion.div>
      ) : errorCountingSubscriptions ? (
        <motion.div
          key="error-tips-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex justify-center items-center w-full h-[256px]">
          <p className="text-lg font-bold text-destructive text-center">
            Error counting subscriptions.
            <br />
            Please try again later!
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="send-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-8">
          <div className="flex flex-col justify-start items-start w-full gap-1">
            <h1 className="font-bold text-2xl">
              Send notifications to all the users subscribed to your brand
            </h1>
            <p className="text-base text-muted-foreground">
              {usersCount === 0
                ? `Currently no user is subscribed`
                : `${usersCount} user${usersCount === 1 ? " is" : "s are"} subscribed to your brand notifications`}
            </p>
          </div>

          <div className="flex flex-col justify-start items-start w-[44%] gap-6">
            <CTSTextInput
              label="Title (32 chars)"
              icon={<PencilLine className="size-5" />}
              placeholder="Enter the notification title"
              value={notificationTitle}
              setValue={setNotificationTitle}
              isUpdating={false}
              sizeLimit={32}
              withConfirmButtons={false}
              showCharacterCount={true}
            />
            <CTSTextInput
              label="Message (128 chars)"
              icon={<Text className="size-5" />}
              placeholder="Enter the notification body message"
              value={notificationBody}
              setValue={setNotificationBody}
              isUpdating={false}
              sizeLimit={128}
              withConfirmButtons={false}
              showCharacterCount={true}
            />
          </div>

          <SendNotificationModal
            notificationTitle={notificationTitle}
            notificationBody={notificationBody}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            brand={brand.data}
            totalTargetUsers={usersCount ?? 0}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
