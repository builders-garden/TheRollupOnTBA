interface HistoryItemProps {
  deadline: string;
  question: string;
  bullPercent: number;
  bearPercent: number;
  totalVotes: number;
  usdcCollected: number;
}

export const HistoryItem = ({
  deadline,
  question,
  bullPercent,
  bearPercent,
  totalVotes,
  usdcCollected,
}: HistoryItemProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-start items-start lg:justify-between lg:items-center w-full pl-10 pr-4">
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
            style={{ width: `${bearPercent}%` }}>
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
    </div>
  );
};
