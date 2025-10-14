import { Bell, BellRing } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import { useMiniApp } from "@/contexts/mini-app-context";
import {
  useCreateNotificationSubscription,
  useDeleteNotificationSubscription,
} from "@/hooks/use-notification-subscriptions";
import { AuthTokenType } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const SubscribeButton = () => {
  const { brand, user } = useMiniAppAuth();
  const { addMiniApp, context } = useMiniApp();

  const [isToggling, setIsToggling] = useState(false);

  // Whether the user is subscribed to the brand
  const isSubscribed = useMemo(
    () => user.isSubscribedToBrand.data,
    [user.isSubscribedToBrand.data],
  );

  // Mutation to subscribe to the brand
  const { mutate: subscribeToBrand } = useCreateNotificationSubscription({
    tokenType: AuthTokenType.MINI_APP_AUTH_TOKEN,
    brandId: brand.data?.id,
    userId: user.data?.id,
  });

  // Mutation to unsubscribe from the brand
  const { mutate: unsubscribeFromBrand } = useDeleteNotificationSubscription({
    tokenType: AuthTokenType.MINI_APP_AUTH_TOKEN,
    brandId: brand.data?.id,
    userId: user.data?.id,
  });

  // A function to handle the subscribe to the brand
  const handleSubscribe = async () => {
    if (!brand.data?.id || !user.data?.id) {
      toast.error("Brand or user not found");
      return;
    }
    // Try to add the miniapp if it is not already added
    if (!context?.client.added) {
      const result = await addMiniApp();
      if (!result) {
        toast.error("Please add the miniapp to subscribe to notifications");
        return;
      }
    }

    setIsToggling(true);
    subscribeToBrand(
      {
        brandId: brand.data.id,
        userId: user.data.id,
      },
      {
        onSuccess: async () => {
          await user.isSubscribedToBrand.refetch();
          toast.success("Subscribed to brand notifications");
          setIsToggling(false);
        },
        onError: () => {
          toast.info("Failed to subscribe to brand notifications");
          setIsToggling(false);
        },
      },
    );
  };

  // A function to handle the unsubscribe from the brand
  const handleUnsubscribe = () => {
    if (!brand.data?.id || !user.data?.id) {
      toast.error("Brand or user not found");
      return;
    }
    setIsToggling(true);
    unsubscribeFromBrand(
      {
        brandId: brand.data.id,
        userId: user.data.id,
      },
      {
        onSuccess: async () => {
          await user.isSubscribedToBrand.refetch();
          toast.success("Unsubscribed from brand");
          setIsToggling(false);
        },
        onError: () => {
          toast.error("Failed to unsubscribe from brand");
          setIsToggling(false);
        },
      },
    );
  };

  // A function to handle the toggle of the subscribe button
  const handleToggleSubscribe = useCallback(async () => {
    // The user is already subscribed to the brand, we need to unsubscribe
    if (isSubscribed) {
      handleUnsubscribe();
    }
    // The user is not subscribed to the brand, we need to subscribe
    else {
      handleSubscribe();
    }
  }, [isSubscribed, handleUnsubscribe, handleSubscribe]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isSubscribed ? (
        <motion.button
          key="subscribed-button"
          disabled={isToggling}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            rotate: [0, 20, -20, 20, 0],
            scale: [1, 1.05, 1.05, 1.05, 1],
          }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.1 } }}
          onClick={handleToggleSubscribe}>
          <BellRing
            className={cn(
              "size-6 cursor-pointer text-warning transition-all duration-300",
              isToggling && "animate-pulse",
            )}
          />
        </motion.button>
      ) : (
        <motion.button
          key="unsubscribed-button"
          disabled={isToggling}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.1 } }}
          onClick={handleToggleSubscribe}>
          <Bell
            className={cn(
              "size-6 cursor-pointer text-black transition-all duration-300",
              isToggling && "animate-pulse",
            )}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
