import { Dispatch, SetStateAction } from "react";
import { NBButton } from "@/components/custom-ui/nb-button";
import { AVAILABLE_DURATIONS } from "@/lib/constants";
import { Duration } from "@/lib/types/poll.type";
import { cn } from "@/lib/utils";

interface FormDurationSelectionProps {
  label?: string;
  selectedDuration: Duration;
  setSelectedDuration: Dispatch<SetStateAction<Duration>>;
}

export const FormDurationSelection = ({
  label,
  selectedDuration,
  setSelectedDuration,
}: FormDurationSelectionProps) => {
  return (
    <div className="flex flex-col justify-start items-start gap-2.5 w-full">
      {/* Label */}
      {label && (
        <div className="flex justify-start items-center gap-2.5">
          <p className="text-base font-bold">{label}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 w-full">
        {AVAILABLE_DURATIONS.map((duration) => (
          <NBButton
            key={duration.value}
            onClick={() => setSelectedDuration(duration)}
            className={cn(
              "w-full rounded-full py-1",
              selectedDuration === duration && "bg-success",
            )}
            showShadow={selectedDuration === duration}
            variant={selectedDuration === duration ? "default" : "outline"}>
            <p
              className={cn(
                "text-base font-bold",
                selectedDuration === duration && "text-white",
              )}>
              {duration.label}
            </p>
          </NBButton>
        ))}
      </div>
    </div>
  );
};
