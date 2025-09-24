import { motion } from "motion/react";

interface HistoryItemProps {
  index: number;
  deadline: string;
  question: string;
  bullPercent: number;
  bearPercent: number;
  totalVotes: number;
  usdcCollected: number;
  currentPage: number;
  previousPage: number;
}

interface PaginationState {
  currentPage: number;
  previousPage: number;
}

const PAGINATION_VARIANTS = {
  initial: (custom: PaginationState) => ({
    opacity: 0,
    x:
      custom.currentPage > custom.previousPage
        ? 30
        : custom.currentPage < custom.previousPage
          ? -30
          : 0,
  }),
  animate: { opacity: 1, x: 0 },
  exit: (custom: PaginationState) => ({
    opacity: 0,
    x:
      custom.currentPage < custom.previousPage
        ? 30
        : custom.currentPage > custom.previousPage
          ? -30
          : 0,
  }),
};

export const HistoryItem = ({
  index,
  deadline,
  question,
  bullPercent,
  bearPercent,
  totalVotes,
  usdcCollected,
  currentPage,
  previousPage,
}: HistoryItemProps) => {
  // If the bear percent is not 0 or 100, calculate the width
  // If the bear percent is greater than 91, set the width to 91
  // If the bear percent is less than 9, set the width to 9
  // Otherwise, set the width to the bear percent
  const bearWidth =
    bearPercent !== 0 && bearPercent !== 100
      ? bearPercent > 91
        ? 91
        : bearPercent < 9
          ? 9
          : bearPercent
      : bearPercent;

  return (
    <motion.div
      key={`history-item-${index}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={PAGINATION_VARIANTS}
      custom={{
        currentPage,
        previousPage,
      }}
      transition={{ duration: 0.15, ease: "easeInOut", delay: index * 0.1 }}
      className="flex flex-col lg:flex-row justify-start items-start lg:justify-between lg:items-center w-full pl-10 pr-4">
      <div className="flex flex-col justify-start items-start gap-1">
        <p className="text-sm italic text-gray-500 shrink-0">
          Deadline: {deadline}
        </p>
        <p className="text-xl font-medium italic truncate">
          &ldquo;{question}&rdquo;
        </p>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Votes: {totalVotes}</span>
          <span>USDC: {usdcCollected.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2.5 w-[38%] shrink-0">
        {bearPercent > 0 && (
          <div
            className="flex flex-col justify-center items-center border bg-destructive rounded-[12px] shrink-0 py-1 px-2.5 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            style={{
              width: `${bearWidth}%`,
            }}>
            <p className="text-base font-extrabold text-white">
              {bearPercent}%
            </p>
          </div>
        )}
        {bullPercent > 0 && (
          <div className="flex flex-col w-full justify-center items-center border bg-success rounded-[12px] py-1 px-2.5 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-base font-extrabold text-white">
              {bullPercent}%
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
