import { Check, SquarePen, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NBTextInputProps {
  label: string;
  inputColor?: "accent" | "destructive";
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onConfirm?: (
    data?: any,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  isUpdating: boolean;
  resetValueAfterConfirm?: boolean;
}

export const NBTextInput = ({
  label,
  inputColor = "accent",
  icon,
  placeholder,
  value,
  setValue,
  onConfirm = () => {},
  isUpdating = false,
  resetValueAfterConfirm = false,
}: NBTextInputProps) => {
  const [editingValue, setEditingValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Whether the input color is destructive
  const isDestructive = inputColor === "destructive";

  // Handles the edit button
  const handleEdit = () => {
    if (isUpdating) return;
    setIsEditing(!isEditing);
    // Focus the input after enabling edit mode
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Handles the activation of the input
  const handleActivateEditing = () => {
    if (isUpdating) return;
    setIsEditing(true);
  };

  // Handle the cancel button
  const handleCancel = () => {
    if (isUpdating) return;
    setIsEditing(false);
    setValue(value);
    setEditingValue(value);
  };

  // Handle the confirm button
  const handleConfirm = () => {
    if (isUpdating) return;
    if (editingValue === value) {
      setIsEditing(false);
      return;
    }
    setValue(editingValue);
    onConfirm(
      editingValue,
      () => {
        setIsEditing(false);
        if (resetValueAfterConfirm) {
          setEditingValue("");
        }
      },
      () => {
        setIsEditing(false);
        if (resetValueAfterConfirm) {
          setEditingValue("");
        }
      },
    );
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
        <p className="text-base font-bold">{label}</p>
      </div>

      <div
        className={cn(
          "flex w-full justify-start items-center gap-2.5 rounded-full border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white transition-all duration-300",
          isEditing && "ring-[2px]",
          isDestructive && "border-destructive ring-destructive/40",
        )}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          disabled={isUpdating}
          className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-base"
          value={editingValue}
          onFocus={handleActivateEditing}
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
              disabled={isUpdating}
              whileHover={{ scale: isUpdating ? 1 : 1.05 }}
              whileTap={{ scale: isUpdating ? 1 : 0.95 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="shrink-0 cursor-pointer"
              onClick={handleEdit}>
              <SquarePen
                className={cn("size-5", isUpdating && "animate-pulse")}
              />
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
                disabled={isUpdating}
                whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                className="cursor-pointer"
                onClick={handleCancel}>
                <X className={cn("size-5", isUpdating && "animate-pulse")} />
              </motion.button>
              <motion.button
                disabled={isUpdating}
                whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                className="cursor-pointer"
                onClick={handleConfirm}>
                <Check
                  className={cn(
                    "size-5 text-success",
                    isUpdating && "animate-pulse",
                  )}
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
