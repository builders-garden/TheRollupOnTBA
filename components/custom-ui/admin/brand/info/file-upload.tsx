import { Loader2, Image as LucideImage, PenBoxIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { usePinataIpfsUpload } from "@/hooks/use-pinata-ipfs";
import { AuthTokenType } from "@/lib/enums";
import { NBButton } from "../../../nb-button";

interface FileUploadProps {
  brandLogoUrl?: string | null;
  label?: string;
  handleUpdateDatabase?: (
    data?: any,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  isUpdatingDatabase: boolean;
}

export const FileUpload = ({
  label,
  brandLogoUrl,
  handleUpdateDatabase = () => {},
  isUpdatingDatabase,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null | undefined>(
    brandLogoUrl || null,
  );
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const { mutate: uploadFileToIPFS } = usePinataIpfsUpload(
    AuthTokenType.ADMIN_AUTH_TOKEN,
  );

  // Handles the file upload trigger
  const handleFileUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  // Handles clearing the file upload input
  const handleClearFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handles the file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.info("No file selected or file format not supported");
      return;
    }

    setIsUploadingFile(true);

    // First of all, upload the file to IPFS
    uploadFileToIPFS(
      { file },
      {
        onSuccess: (data) => {
          handleUpdateDatabase(
            data.url,
            () => {
              setPreviewUrl(data.url!);
              setIsUploadingFile(false);
            },
            () => {
              setIsUploadingFile(false);
              handleClearFileUpload();
            },
          );
        },
        onError: () => {
          toast.error("Failed to upload file to IPFS");
          setIsUploadingFile(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col justify-start items-start gap-2.5 w-full">
      {/* Label and edit button */}
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-start items-center gap-2.5">
          <LucideImage className="size-5" />
          <p className="text-base font-bold">{label ?? "Logo"}</p>
        </div>
        <AnimatePresence mode="wait">
          {previewUrl && (
            <motion.button
              key="edit-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFileUploadTrigger}
              className="cursor-pointer shrink-0">
              <PenBoxIcon className="size-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Upload button or image preview */}
      <div className="flex flex-col justify-start items-start gap-5 w-full h-full">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUpdatingDatabase || isUploadingFile}
        />

        {/* Upload button or image preview */}
        <AnimatePresence mode="wait">
          {isUploadingFile ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[86%]">
              <Loader2 className="size-7 animate-spin" />
            </motion.div>
          ) : !previewUrl ? (
            <motion.div
              key="upload-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-start items-center w-full">
              <NBButton
                onClick={handleFileUploadTrigger}
                className="w-full bg-accent">
                <p className="text-base font-bold text-white">Upload</p>
              </NBButton>
            </motion.div>
          ) : (
            <motion.div
              key="image-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-start items-center w-fit">
              <Image
                src={previewUrl}
                alt={`${label ?? "Logo"} preview`}
                width={100}
                height={100}
                className="w-fit h-[155px] object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
