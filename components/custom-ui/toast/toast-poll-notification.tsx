"use client";

import { AnimatePresence, easeIn, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { NumberTicker } from "@/components/shadcn-ui/number-ticker";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { ServerToClientSocketEvents } from "@/lib/enums";
import { UpdatePollNotificationEvent } from "@/lib/types/socket";
import { cn } from "@/lib/utils";
import { BearIcon } from "../icons/bear-icon";
import { BullIcon } from "../icons/bull-icon";

export interface PollNotificationData {
  id: string;
  pollQuestion: string;
  endTime: Date;
  votes: number;
  voters: number;
  qrCodeUrl: string;
  position: string;
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
    <motion.div
      className="flex items-center w-full min-w-[1000px] rounded-xl overflow-hidden border-4 border-[#E6B45E]"
      initial={{ opacity: 0, scale: 0, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        rotate: { type: "spring", visualDuration: 0.45, bounce: 0.3 },
      }}>
      <motion.div
        className={cn(
          // TODO: add 85%  transparency on BG
          "h-14 flex items-center justify-center bg-[#CF5953]",
          normalizedBear > 0 ? "px-4" : "px-0",
        )}
        initial={{ width: "50%" }}
        animate={{ width: `${normalizedBear}%` }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 60,
          delay: 0.45,
        }}>
        <span className="flex items-center gap-1 text-white font-overused-grotesk font-black text-2xl">
          <BearIcon className="w-8 h-8" />{" "}
          <NumberTicker
            value={normalizedBear}
            startValue={50}
            className="whitespace-pre-wrap text-white font-overused-grotesk font-black text-2xl tracking-tighter shrink-0"
            delay={0.45}
          />
          %
        </span>
      </motion.div>
      <motion.div
        className={cn(
          // TODO: add 85%  transparency on BG
          "h-14 flex items-center justify-center bg-[#4CAF50]",
          normalizedBull > 0 ? "px-4" : "px-0",
        )}
        initial={{ width: "50%" }}
        animate={{ width: `${normalizedBull}%` }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 60,
          delay: 0.45,
        }}>
        <span className="flex items-center gap-1 text-white font-overused-grotesk font-black text-2xl">
          <BullIcon className="w-8 h-8 fill-white" />{" "}
          <NumberTicker
            value={normalizedBull}
            startValue={50}
            className="whitespace-pre-wrap text-white font-overused-grotesk font-black text-2xl tracking-tighter shrink-0"
            delay={0.45}
          />
          %
        </span>
      </motion.div>
    </motion.div>
  );
};

export const ToastPollNotification = ({
  data,
}: {
  data: PollNotificationData;
}) => {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();
  const [_, setVoters] = useState<number>(data.voters);
  const [votes, setVotes] = useState<number>(data.votes);
  const [results, setResults] = useState<{
    bullPercent: number;
    bearPercent: number;
  }>(data.results || { bullPercent: 0, bearPercent: 0 });

  const endTimeMs = useMemo(
    () => new Date(data.endTime).getTime(),
    [data.endTime],
  );

  // Create event handlers
  const handleUpdateSentimentPoll = (data: UpdatePollNotificationEvent) => {
    setVoters(data.voters);
    setVotes(data.votes);
    if (data.results) {
      setResults(data.results);
    }
  };

  useEffect(() => {
    // Join the stream
    joinStream({
      username: "Poll",
      profilePicture: "https://via.placeholder.com/150",
    });
    subscribe(
      ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL,
      handleUpdateSentimentPoll,
    );

    return () => {
      unsubscribe(
        ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL,
        handleUpdateSentimentPoll,
      );
    };
  }, []);

  // Compute directional offsets based on toast position
  const isLeft = data.position?.includes("left");
  const isRight = data.position?.includes("right");
  const isCenter = data.position?.includes("center");
  const isTop = data.position?.startsWith("top");
  const xOffset = isLeft ? 100 : isRight ? -100 : 0;
  const yOffset = isCenter ? (isTop ? 100 : -100) : 0;

  const getSecondsRemaining = useMemo(() => {
    return () => Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000));
  }, [endTimeMs]);

  const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsRemaining());

  useEffect(() => {
    setSecondsLeft(getSecondsRemaining());

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        const next = getSecondsRemaining();
        setSecondsLeft((prev) => {
          if (prev !== next) {
            return next;
          }
          return prev;
        });
        if (next <= 0 && intervalId) {
          clearInterval(intervalId);
        }
      }, 1000);
    }, msUntilNextSecond);

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
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        key={data.id}
        initial={{
          opacity: 0,
          x: xOffset,
          y: yOffset,
          scale: 0.75,
        }}
        animate={{
          opacity: 1,
          y: 0,
          x: 0,
          scale: [0.75, 1.2, 1],
          transition: {
            duration: 0.9,
            ease: [0.19, 1.0, 0.22, 1.0],
            opacity: { duration: 0.3 },
            scale: { times: [0, 0.6, 1], duration: 0.9 },
            rotate: { times: [0, 0.6, 1], duration: 0.9 },
          },
        }}
        exit={{
          opacity: 0,
          x: xOffset ? -xOffset : 0,
          y: yOffset ? -yOffset : 50,
          scale: 0.8,
          transition: { duration: 0.4, ease: easeIn },
        }}
        className="flex flex-col gap-1 font-overused-grotesk w-full">
        {isVotingClosed && results ? (
          <ResultsBar
            bearPercent={results.bearPercent}
            bullPercent={results.bullPercent}
          />
        ) : null}

        <div className="bg-gradient-to-b bg-[#1B2541] rounded-xl shadow-lg px-6 py-2 flex items-center justify-between gap-6 min-w-[1000px] min-h-[130px] border-4 border-[#E6B45E] font-grotesk text-white">
          <p className="flex items-center gap-1 text-xl">
            <BullIcon className="w-12 h-12 fill-[#4CAF50]" /> or{" "}
            <BearIcon className="w-12 h-12 fill-[#CF5953]" />?
          </p>
          <span className="text-3xl font-black">{data.pollQuestion}</span>
          <div className="flex flex-col items-center gap-0">
            <span className="text-[#E6B45E] font-bold text-2xl">
              {timeLabel}
            </span>
            <span className="text-gray-400 text-base">
              {votes.toString()} votes
            </span>
          </div>
          <div className="bg-white p-1">
            <QRCodeSVG value={data.qrCodeUrl} size={82} level="M" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
