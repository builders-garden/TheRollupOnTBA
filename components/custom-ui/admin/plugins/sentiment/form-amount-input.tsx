import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useState } from "react";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { cn } from "@/lib/utils";

interface FormAmountInputProps {
  label?: string;
  placeholder: string;
  step?: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>> | ((newValue: string) => void);
  className?: string;
  disabled?: boolean;
}

export const FormAmountInput = ({
  label,
  placeholder,
  step,
  value,
  setValue,
  className,
  disabled,
}: FormAmountInputProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Handle the cancel button
  const handleCancel = () => {
    setValue("");
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-start items-start gap-2.5 w-full transition-all duration-300",
        disabled && "opacity-50",
        className,
      )}>
      {/* Label */}
      {label && (
        <div className="flex justify-start items-center gap-2.5 w-full">
          <p className="text-base font-bold shrink-0 w-fit">{label}</p>
          <CTSButton
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setValue("0.01");
            }}
            showShadow={false}
            className="w-fit px-2.5 py-0.5 rounded-full">
            <p className="text-xs font-extrabold">Default $0.01</p>
          </CTSButton>
        </div>
      )}

      <div
        className={cn(
          "flex w-full justify-start items-center gap-2.5 rounded-full border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white transition-all duration-300",
          isEditing && "ring-[2px]",
        )}>
        <input
          type="number"
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-base"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />

        <AnimatePresence mode="wait">
          {!disabled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={handleCancel}>
              <X className="size-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
