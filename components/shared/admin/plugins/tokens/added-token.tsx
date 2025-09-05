import { NBCard } from "@/components/shared/nb-card";

export const AddedToken = () => {
  return (
    <NBCard>
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-start items-center gap-2.5">
          <div className="size-10 bg-success rounded-full" />
          <div className="flex flex-col justify-start items-start gap-0.5">
            <h1 className="text-[18px] font-bold">Token Name</h1>
            <p className="text-[14px] opacity-50 font-bold">$TOKEN</p>
          </div>
        </div>
      </div>
    </NBCard>
  );
};
