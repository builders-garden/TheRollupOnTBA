import { NBButton } from "@/components/shared/mini-app/nb-button";
import { NBCard } from "@/components/shared/mini-app/nb-card";
import { cn } from "@/lib/utils";

interface BullmeterProps {
  showLabel?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
  title: string;
  timeLeft: string;
  button1text: string;
  button2text: string;
  button1Color?: string;
  button2Color?: string;
  button1OnClick?: () => void;
  button2OnClick?: () => void;
}

export const Bullmeter = ({
  showLabel = true,
  label = "Sentiment poll",
  className,
  cardClassName,
  title,
  timeLeft,
  button1text,
  button2text,
  button1Color,
  button2Color,
  button1OnClick,
  button2OnClick,
}: BullmeterProps) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-start w-full gap-2.5",
        className,
      )}>
      {showLabel && <h1 className="text-[14px] font-bold">{label}</h1>}
      <NBCard className={cn("w-full items-start gap-2.5", cardClassName)}>
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-[24px] font-bold">{title}</h1>
          <div className="flex justify-start items-center gap-1.5">
            <div className="size-2 bg-[#41CB6E] rounded-full animate-pulse animate-infinite animate-ease-linear" />
            <p className="text-[14px] font-medium">{timeLeft} left to vote</p>
          </div>
        </div>

        <div className="flex justify-between items-center w-full gap-2.5">
          {/* Button 1 */}
          <NBButton
            onClick={button1OnClick}
            className={`bg-${button1Color} w-full`}>
            <p className="text-white text-[24px] font-extrabold">
              {button1text}
            </p>
          </NBButton>
          {/* Button 2 */}
          <NBButton
            onClick={button2OnClick}
            className={`bg-${button2Color} w-full`}>
            <p className="text-white text-[24px] font-extrabold">
              {button2text}
            </p>
          </NBButton>
        </div>
      </NBCard>
    </div>
  );
};
