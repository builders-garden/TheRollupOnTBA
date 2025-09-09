interface HistoryItemProps {
  time: string;
  question: string;
  bullPercent: number;
  bearPercent: number;
}

export const HistoryItem = ({
  time,
  question,
  bullPercent,
  bearPercent,
}: HistoryItemProps) => {
  return (
    <div className="flex justify-between items-center w-full gap-48 pl-10 pr-4">
      <div className="flex justify-start items-center gap-3">
        <p className="text-xl font-medium shrink-0">{time}</p>
        <p className="text-xl font-extrabold">•</p>
        <p className="text-xl font-medium italic">“{question}”</p>
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
