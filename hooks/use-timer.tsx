/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

interface UseTimerProps {
  initialSeconds: number;
  onEnd?: () => Promise<void>;
}

interface UseTimerReturn {
  timeString: string;
  remainingSeconds: number;
  isPaused: boolean;
  addSeconds: (seconds: number) => void;
  startTimer: (customSeconds?: number) => void;
  stopTimer: () => void;
}

export const useTimer = ({
  initialSeconds,
  onEnd,
}: UseTimerProps): UseTimerReturn => {
  const [isTimerGoing, setIsTimerGoing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  const addSeconds = (seconds: number) => {
    setRemainingSeconds((prev) => Math.max(0, prev + seconds));
  };

  const startTimer = (customSeconds?: number) => {
    setRemainingSeconds(customSeconds ?? initialSeconds);
    setIsTimerGoing(true);
    setIsPaused(false);
  };

  const stopTimer = () => {
    setIsTimerGoing(false);
    setIsPaused(true);
  };

  useEffect(() => {
    if (!isTimerGoing) return;

    if (remainingSeconds <= 0) {
      setRemainingSeconds(0);
      if (onEnd) {
        onEnd();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (onEnd) {
            onEnd();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [remainingSeconds, onEnd, isTimerGoing]);

  return {
    timeString: formatTime(remainingSeconds),
    remainingSeconds,
    isPaused,
    addSeconds,
    startTimer,
    stopTimer,
  };
};
