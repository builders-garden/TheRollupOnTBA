import { Image, PenBoxIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { NBButton } from "../../nb-button";

export const FileUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handles the file upload
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handles the file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // TODO: Handle file upload logic here
    }
  };

  return (
    <div className="flex flex-col justify-start items-start gap-2.5 w-full">
      {/* Label and edit button */}
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-start items-center gap-2.5">
          <Image className="size-5" />
          <p className="text-base font-bold">Logo</p>
        </div>
        <AnimatePresence mode="wait">
          {previewUrl && (
            <motion.button
              key="edit-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFileUpload}
              className="cursor-pointer shrink-0">
              <PenBoxIcon className="size-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Upload button or image preview */}
      <div className="flex flex-col justify-start items-start gap-5 w-full">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload button or image preview */}
        {!previewUrl ? (
          <NBButton onClick={handleFileUpload} className="w-full bg-accent">
            <p className="text-base font-bold text-white">Upload</p>
          </NBButton>
        ) : (
          <img
            src={previewUrl}
            alt="Logo preview"
            className="w-fit h-[155px] object-contain bg-gray-50"
          />
        )}
      </div>
    </div>
  );
};
