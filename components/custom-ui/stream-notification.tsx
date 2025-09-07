import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useNotificationQueue } from "@/contexts/notification-queue-context";

export function StreamNotification() {
  const { activeNotification, removeFromQueue } = useNotificationQueue();

  useEffect(() => {
    if (activeNotification) {
      console.log("Setting up timer for notification:", activeNotification.id);
      const timer = setTimeout(() => {
        console.log("Removing notification:", activeNotification.id);
        removeFromQueue(activeNotification.id);
      }, 2000);

      return () => {
        console.log(
          "Cleaning up timer for notification:",
          activeNotification.id,
        );
        clearTimeout(timer);
      };
    }
  }, [activeNotification, removeFromQueue]);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] border border-gray-200">
          <img
            src={activeNotification.profilePicture}
            alt={activeNotification.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {activeNotification.username}
            </h3>
            {activeNotification.text && (
              <p className="text-sm text-gray-600">{activeNotification.text}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
