import { Check, SquarePen, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GenericTextInputProps {
  label: string;
  inputColor?: "accent" | "destructive";
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

export const GenericTextInput = ({
  label,
  inputColor = "accent",
  icon,
  placeholder,
  value,
  setValue,
}: GenericTextInputProps) => {
  const [editingValue, setEditingValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Whether the input color is destructive
  const isDestructive = inputColor === "destructive";

  // Handles the edit button
  const handleEdit = () => {
    setIsEditing(!isEditing);
    // Focus the input after enabling edit mode
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Handle the cancel button
  const handleCancel = () => {
    setIsEditing(false);
    setValue(value);
    setEditingValue(value);
  };

  // Handle the confirm button
  const handleConfirm = () => {
    setIsEditing(false);
    setValue(editingValue);
  };

  return (
    <div className="flex flex-col justify-start items-start gap-2.5 w-full">
      {/* Label */}
      <div
        className={cn(
          "flex justify-start items-center gap-2.5",
          isDestructive && "text-destructive",
        )}>
        {icon}
        <p className="text-[16px] font-bold">{label}</p>
      </div>

      <div
        className={cn(
          "flex w-full justify-start items-center gap-2.5 rounded-full border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white",
          isEditing && "ring-[2px]",
          isDestructive && "border-destructive ring-destructive/40",
        )}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          disabled={!isEditing}
          className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-[16px]"
          value={editingValue}
          onChange={(e) => {
            setEditingValue(e.target.value);
          }}
        />

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.button
              key={`SquarePen-button`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="shrink-0 cursor-pointer"
              onClick={handleEdit}>
              <SquarePen className="size-5" />
            </motion.button>
          ) : (
            <motion.div
              key="cancel-confirm-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex justify-center items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
                onClick={handleCancel}>
                <X className="size-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
                onClick={handleConfirm}>
                <Check className="size-5 text-success" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
