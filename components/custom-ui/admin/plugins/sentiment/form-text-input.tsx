import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useState } from "react";
import { cn } from "@/lib/utils";

interface FormTextInputProps {
  label?: string;
  placeholder: string;
  sizeLimit?: number;
  value: string;
  setValue: Dispatch<SetStateAction<string>> | ((newValue: string) => void);
  className?: string;
  disabled?: boolean;
}

export const FormTextInput = ({
  label,
  placeholder,
  value,
  setValue,
  sizeLimit,
  className,
  disabled,
}: FormTextInputProps) => {
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
        <div className="flex justify-start items-center gap-2.5">
          <p className="text-base font-bold">{label}</p>
        </div>
      )}

      <div
        className={cn(
          "flex w-full justify-start items-center gap-2.5 rounded-full border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white transition-all duration-300",
          isEditing && "ring-[2px]",
        )}>
        <input
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-base"
          value={value}
          onChange={(e) => {
            if (sizeLimit && e.target.value.length > sizeLimit) {
              return;
            }
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
