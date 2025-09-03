import { NBButton } from "@/components/shared/mini-app/nb-button";
import { cn } from "@/lib/utils";

interface TipsProps {
  label: string;
  showLabel?: boolean;
  className?: string;
  tips: {
    amount: number;
    onClick: () => void;
    textClassName?: string;
    buttonColor?: "blue" | "black";
    buttonClassName?: string;
  }[];
  customTipButton?: {
    color?: "blue" | "black";
    text?: string;
    textClassName?: string;
    buttonClassName?: string;
  };
}

export const Tips = ({
  label,
  showLabel = true,
  tips,
  customTipButton,
}: TipsProps) => {
  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      {showLabel && <h1 className="text-[14px] font-bold">{label}</h1>}
      <div className="grid grid-cols-4 w-full gap-2.5">
        {tips.map((tip) => (
          <NBButton
            buttonColor={tip.buttonColor}
            onClick={tip.onClick}
            className={cn("w-full", tip.buttonClassName)}>
            <p className={cn("text-[16px] font-extrabold", tip.textClassName)}>
              ${tip.amount}
            </p>
          </NBButton>
        ))}

        {!!customTipButton && (
          <NBButton
            buttonColor={customTipButton.color}
            onClick={() => {}}
            className={cn("w-full", customTipButton.buttonClassName)}>
            <p
              className={cn(
                "text-[16px] font-extrabold",
                customTipButton.textClassName,
              )}>
              {customTipButton.text}
            </p>
          </NBButton>
        )}
      </div>
    </div>
  );
};
