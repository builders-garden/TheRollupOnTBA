import { Check, SquarePen, Text, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { cn } from "@/lib/utils";

interface TextDescriptionAreaProps {
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  onConfirm?: (
    data?: any,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  isUpdating: boolean;
  limit?: number;
}

export const TextDescriptionArea = ({
  description,
  setDescription,
  onConfirm = () => {},
  isUpdating,
  limit = 200,
}: TextDescriptionAreaProps) => {
  const [editingDescription, setEditingDescription] = useState(description);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handles the edit button
  const handleEdit = () => {
    setIsEditing(!isEditing);
    // Focus the textarea after enabling edit mode
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Handles the activation of the textarea
  const handleActivateEditing = () => {
    if (isUpdating) return;
    setIsEditing(true);
  };

  // Handle the cancel button
  const handleCancel = () => {
    setIsEditing(false);
    setDescription(description);
    setEditingDescription(description);
  };

  // Handle the confirm button
  const handleConfirm = () => {
    if (editingDescription === description) {
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    setDescription(editingDescription);
    onConfirm(
      editingDescription,
      () => {
        setIsEditing(false);
      },
      () => {
        setIsEditing(false);
      },
    );
  };

  return (
    <div className="flex flex-col justify-start items-start gap-2.5 w-full">
      {/* Label and edit button */}
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-start items-center gap-2.5">
          <Text className="size-5 text-muted-foreground" />
          <p className="text-base font-bold text-muted-foreground">
            Description ({limit} chars)
          </p>
        </div>
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
                className={cn(
                  "size-5 text-muted-foreground",
                  isUpdating && "animate-pulse",
                )}
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
                <X
                  className={cn(
                    "size-5 text-muted-foreground",
                    isUpdating && "animate-pulse",
                  )}
                />
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

      {/* Text description area */}
      <div className="flex flex-col w-full justify-center items-start">
        <Textarea
          ref={textareaRef}
          placeholder="Your livestream description here..."
          disabled={isUpdating}
          value={editingDescription}
          onFocus={handleActivateEditing}
          onChange={(e) => {
            setEditingDescription(e.target.value.slice(0, limit));
          }}
          className="w-full h-[155px] rounded-[12px] border-[1px] border-muted focus-visible:border-muted-foreground/40 p-2.5 text-base focus-visible:ring-muted-foreground/40 focus-visible:ring-[2px] disabled:opacity-100 disabled:cursor-default resize-none transition-all duration-300"
        />
        <p className="text-xs text-muted-foreground mt-[1px] ml-1">
          {editingDescription.length}/{limit} characters
        </p>
      </div>
    </div>
  );
};
