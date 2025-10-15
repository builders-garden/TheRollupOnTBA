"use client";

import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";

export interface NotificationData {
  id?: string;
  username: string;
  profilePicture: string;
  text?: string;
  customMessage?: string;
}

export const ToastNotification = ({
  data,
  slideOffset = 0,
}: {
  data: NotificationData;
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
  } as const;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        {...motionProps}
        className="bg-[#1B2541] rounded-3xl shadow-lg p-4 flex flex-col justify-center items-center gap-2 min-w-[500px] border-8 border-[#E6B45E] font-overused-grotesk cursor-default">
        <div className="flex justify-start items-center gap-3 w-full">
          <img
            src={data.profilePicture}
            alt={data.username}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 text-white overflow-hidden">
            <p className="w-full flex gap-1 text-2xl font-medium">
              <span className="truncate">{data.username}</span>
              {data.text && (
                <span className="shrink-0 text-2xl font-bold">{data.text}</span>
              )}
            </p>
          </div>
        </div>

        {data.customMessage && (
          <div className="flex justify-center items-center gap-3 w-full">
            <p className="text-white text-lg italic">
              &quot;{data.customMessage}&quot;
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
