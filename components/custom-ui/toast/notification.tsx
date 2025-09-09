"use client";

import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";

export interface NotificationData {
  id?: string;
  username: string;
  profilePicture: string;
  text?: string;
}

export const Notification = ({
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
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="bg-[#1B2541] rounded-3xl shadow-lg p-4 flex items-center gap-3 min-w-[400px] border-8 border-[#E6B45E] font-overused-grotesk">
        <img
          src={data.profilePicture}
          alt={data.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 flex items-center gap-2 text-white">
          <span className="text-xl font-medium">{data.username}</span>
          {data.text && <span className="text-xl">sent a</span>}
          {data.text && <span className="text-xl font-bold">{data.text}</span>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
