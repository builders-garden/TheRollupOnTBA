import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";
import { NotificationData } from "@/contexts/notification-queue-context";

const NotificationContent = ({
  notificationData,
  isExiting = false,
  isTransitioning = false,
  slideOffset = 0,
}: {
  notificationData: NotificationData;
  isExiting?: boolean;
  isTransitioning?: boolean;
  slideOffset?: number;
}) => {
  const motionProps = {
    initial: { opacity: 0, x: slideOffset, scale: 0.95 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: easeOut,
        opacity: { duration: 0.1 },
        scale: {
          duration: 0.2,
          ease: "circOut",
        },
      },
    },
    exit: {
      opacity: 0,
      x: -slideOffset,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: easeIn,
      },
    },
  };

  return (
    <motion.div
      key={notificationData.id}
      {...motionProps}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={`absolute bg-[#1B2541] rounded-3xl shadow-lg p-4 flex items-center gap-3 min-w-[400px] border-8 border-[#E6B45E]`}>
      <img
        src={notificationData.profilePicture}
        alt={notificationData.username}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1 flex items-center gap-2 text-white">
        <span className="text-xl font-medium">{notificationData.username}</span>
        <span className="text-xl">sent a</span>
        {notificationData.text && (
          <span className="text-xl font-bold">{notificationData.text}</span>
        )}
      </div>
    </motion.div>
  );
};

export const Notification = ({
  slideOffset,
  data,
  previousData,
  isTransitioning,
}: {
  slideOffset: number;
  data?: NotificationData | null;
  previousData?: NotificationData | null;
  isTransitioning?: boolean;
}) => {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {data && (
        <NotificationContent
          key={data.id}
          notificationData={data}
          isTransitioning={isTransitioning}
          slideOffset={slideOffset}
        />
      )}
    </AnimatePresence>
  );
};
