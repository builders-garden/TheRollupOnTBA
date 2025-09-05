import { SquareArrowOutUpRight } from "lucide-react";

export const NewfoundToken = () => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex justify-start items-center gap-2.5">
        <div className="size-10 bg-success rounded-full" />
        <div className="flex flex-col justify-start items-start gap-1">
          <h1 className="text-[18px] font-bold">Token Name</h1>
          <p className="text-[14px] opacity-50 font-bold">$TOKEN</p>
        </div>
      </div>
      <div className="flex justify-end items-center gap-5">
        <div className="flex flex-col justify-start items-end gap-1">
          <p className="text-[14px] opacity-50 font-bold">Chain</p>
          <p className="text-[14px] opacity-50 font-bold">0xb124...7890</p>
        </div>
        <button className="cursor-pointer" onClick={() => {}}>
          <SquareArrowOutUpRight className="size-7 opacity-50" />
        </button>
      </div>
    </div>
  );
};
