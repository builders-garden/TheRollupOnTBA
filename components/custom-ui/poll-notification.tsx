import { AnimatePresence, easeIn, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

export interface PollNotificationData {
  id: string;
  pollQuestion: string;
  endTime: Date;
  votes: number;
  voters: number;
  qrCodeUrl: string;
  results?: {
    bullPercent: number;
    bearPercent: number;
  };
}

const formatSecondsToClock = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(1, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const ResultsBar = ({
  bearPercent,
  bullPercent,
}: {
  bearPercent: number;
  bullPercent: number;
}) => {
  const clampedBear = Math.max(0, Math.min(100, bearPercent));
  const clampedBull = Math.max(0, Math.min(100, bullPercent));
  const total = clampedBear + clampedBull;
  const normalizedBear = total === 0 ? 50 : (clampedBear / total) * 100;
  const normalizedBull = 100 - normalizedBear;

  return (
    <div className="flex items-center w-full min-w-[800px] rounded-3xl overflow-hidden border-4 border-[#E6B45E]">
      <div
        className="h-12 flex items-center justify-start bg-[#C56E6E] px-4"
        style={{ width: `${normalizedBear}%` }}>
        <span className="text-white font-grotesk font-bold">
          🐻 {Math.round(normalizedBear)}%
        </span>
      </div>
      <div
        className="h-12 flex items-center justify-end bg-[#5FAF63] px-4"
        style={{ width: `${normalizedBull}%` }}>
        <span className="text-white font-grotesk font-bold">
          🐂 {Math.round(normalizedBull)}%
        </span>
      </div>
    </div>
  );
};

const PollNotificationContent = ({
  notificationData,
}: {
  notificationData: PollNotificationData;
}) => {
  const endTimeMs = useMemo(
    () => new Date(notificationData.endTime).getTime(),
    [notificationData.endTime],
  );

  const getSecondsRemaining = useMemo(() => {
    return () => Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000));
  }, [endTimeMs]);

  const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsRemaining());

  useEffect(() => {
    // Update immediately when endTime changes
    setSecondsLeft(getSecondsRemaining());

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const startInterval = () => {
      intervalId = setInterval(() => {
        const next = getSecondsRemaining();
        // Only update when value changes to avoid extra re-renders
        setSecondsLeft((prev) => (prev !== next ? next : prev));
        if (next <= 0 && intervalId) {
          clearInterval(intervalId);
        }
      }, 1000);
    };

    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    timeoutId = setTimeout(startInterval, msUntilNextSecond);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [getSecondsRemaining]);

  const isVotingClosed = secondsLeft <= 0;
  const timeLabel = isVotingClosed
    ? "Voting closed"
    : `${formatSecondsToClock(secondsLeft)} left to vote`;

  return (
    <motion.div
      key={notificationData.id}
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: [0.8, 1.15, 1],
        transition: {
          duration: 0.8,
          ease: [0.19, 1.0, 0.22, 1.0],
          opacity: { duration: 0.4 },
          scale: {
            times: [0, 0.6, 1],
            duration: 0.8,
          },
        },
      }}
      exit={{
        opacity: 0,
        y: 50,
        scale: 0.8,
        transition: {
          duration: 0.4,
          ease: easeIn,
        },
      }}
      className="flex flex-col gap-3">
      {isVotingClosed && notificationData.results && (
        <ResultsBar
          bearPercent={notificationData.results.bearPercent}
          bullPercent={notificationData.results.bullPercent}
        />
      )}

      <div className="bg-gradient-to-b from-[#1B2541] to-[#0F1629] rounded-3xl shadow-lg p-6 flex items-center justify-between gap-6 min-w-[800px] border-4 border-[#E6B45E] font-grotesk text-white">
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
          <span className="text-[#E6B45E] font-bold text-2xl">{timeLabel}</span>
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
      </div>
    </motion.div>
  );
};

export const PollNotification = ({
  data,
}: {
  data?: PollNotificationData | null;
}) => {
  return (
    <div className="absolute top-4 left-4 z-50">
      <AnimatePresence mode="wait" initial={true}>
        {data && (
          <PollNotificationContent key={data.id} notificationData={data} />
        )}
      </AnimatePresence>
    </div>
  );
};
