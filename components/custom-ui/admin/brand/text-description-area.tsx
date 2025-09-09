import { Check, SquarePen, Text, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Textarea } from "@/components/shadcn-ui/textarea";

interface TextDescriptionAreaProps {
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
}

export const TextDescriptionArea = ({
  description,
  setDescription,
}: TextDescriptionAreaProps) => {
  const [editingDescription, setEditingDescription] = useState("");
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

  // Handle the cancel button
  const handleCancel = () => {
    setIsEditing(false);
    setDescription(description);
    setEditingDescription(description);
  };

  // Handle the confirm button
  const handleConfirm = () => {
    setIsEditing(false);
    setDescription(editingDescription);
  };

  return (
    <div className="flex flex-col justify-start items-start gap-2.5 w-full">
      {/* Label and edit button */}
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-start items-center gap-2.5">
          <Text className="size-5" />
          <p className="text-base font-bold">Description (200 chars)</p>
        </div>
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

      {/* Text description area */}
      <div className="flex flex-col w-full justify-center items-start">
        <Textarea
          ref={textareaRef}
          placeholder="Your livestream description here..."
          disabled={!isEditing}
          value={editingDescription}
          onChange={(e) => {
            setEditingDescription(e.target.value.slice(0, 200));
          }}
          className="w-full h-[155px] rounded-[12px] border-[1px] border-accent p-2.5 bg-white text-base focus-visible:ring-accent/40 focus-visible:ring-[2px] disabled:opacity-100 disabled:cursor-default resize-none transition-all duration-300"
        />
        <p className="text-xs text-muted-foreground mt-[1px] ml-1">
          {editingDescription.length}/200 characters
        </p>
      </div>
    </div>
  );
};
