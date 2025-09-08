import { AnimatePresence, easeIn, motion } from "motion/react";
import QRCode from "react-qr-code";

export interface PollNotificationData {
  id: string;
  pollQuestion: string;
  timeLeft: string;
  votes: number;
  voters: number;
  qrCodeUrl: string;
}

const PollNotificationContent = ({
  notificationData,
  isExiting = false,
  isTransitioning = false,
  slideOffset = 0,
}: {
  notificationData: PollNotificationData;
  isExiting?: boolean;
  isTransitioning?: boolean;
  slideOffset?: number;
}) => {
  const motionProps = {
    initial: { opacity: 0, y: -100, scale: 0.8 },
    animate: {
      opacity: 1,
      y: 0,
      scale: [0.8, 1.15, 1],
      transition: {
        duration: 0.8,
        ease: [0.19, 1.0, 0.22, 1.0], // Custom easing
        opacity: { duration: 0.4 },
        scale: {
          times: [0, 0.6, 1],
          duration: 0.8,
        },
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.8,
      transition: {
        duration: 0.4,
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
      className="bg-gradient-to-b from-[#1B2541] to-[#0F1629] rounded-3xl shadow-lg p-6 flex items-center justify-between gap-6 min-w-[800px] border-4 border-[#E6B45E] font-grotesk text-white">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex gap-2 text-3xl">
          <span>🐂</span>
          <span className="mx-2 font-grotesk">or</span>
          <span>🐻</span>
        </div>
        <span className="text-2xl font-bold font-grotesk">
          {notificationData.pollQuestion}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0">
        <span className="text-[#E6B45E] font-bold text-2xl">
          {notificationData.timeLeft} left to vote
        </span>
        <span className="text-gray-400 text-lg">
          {notificationData.votes.toLocaleString()} votes •{" "}
          {notificationData.voters.toLocaleString()} voters
        </span>
      </div>
      <div className="bg-white p-3 rounded-xl">
        <QRCode
          value={notificationData.qrCodeUrl}
          size={80}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 256 256`}
        />
      </div>
    </motion.div>
  );
};

export const PollNotification = ({
  slideOffset,
  data,
  previousData,
  isTransitioning,
}: {
  slideOffset: number;
  data?: PollNotificationData | null;
  previousData?: PollNotificationData | null;
  isTransitioning?: boolean;
}) => {
  return (
    <div className="absolute top-4 left-4 z-50">
      <AnimatePresence mode="wait" initial={true}>
        {data && (
          <PollNotificationContent
            key={data.id}
            notificationData={data}
            isTransitioning={isTransitioning}
            slideOffset={slideOffset}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
