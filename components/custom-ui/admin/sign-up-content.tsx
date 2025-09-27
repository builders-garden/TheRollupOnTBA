import { Loader2, Signature, Text } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useCreateAdmin } from "@/hooks/use-admins";
import { useCreateBrand } from "@/hooks/use-brands";
import { useCreateTipSettings } from "@/hooks/use-tip-settings";
import { slugify } from "@/lib/utils";
import { NBButton } from "../nb-button";
import { FileUpload } from "./brand/info/file-upload";

export const SignUpContent = () => {
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false);

  const { mutate: createBrand } = useCreateBrand();
  const { mutate: createAdmin } = useCreateAdmin();
  const { mutate: createTipSettings } = useCreateTipSettings();
  const { brand, admin: connectedAdmin } = useAdminAuth();

  // Handles the create brand button click
  const handleCreateBrand = async () => {
    if (
      isCreatingNewBrand ||
      !brandName ||
      !logoUrl ||
      !description ||
      !connectedAdmin.address
    )
      return;
    setIsCreatingNewBrand(true);

    // Create the brand
    createBrand(
      {
        name: brandName,
        slug: slugify(brandName),
        logoUrl,
        description,
      },
      {
        onSuccess: async (response) => {
          // On brand creations success, call the create admin mutation
          createAdmin(
            {
              address: connectedAdmin.address as Address,
              baseName: connectedAdmin.baseName,
              ensName: connectedAdmin.ensName,
              brandId: response.data.id,
            },
            {
              onSuccess: async () => {
                // On admin creations success, call the create tip settings mutation
                createTipSettings(
                  {
                    brandId: response.data.id,
                    payoutAddress: connectedAdmin.address as Address,
                    payoutBaseName: connectedAdmin.baseName,
                    payoutEnsName: connectedAdmin.ensName,
                  },
                  {
                    onSuccess: async () => {
                      await brand.refetch();
                      setIsCreatingNewBrand(false);
                      toast.success("Brand created successfully");
                    },
                    onError: () => {
                      toast.error("Error while creating tip settings");
                    },
                  },
                );
              },
              onError: () => {
                toast.error("Error while creating admin");
              },
            },
          );
        },
        onError: () => {
          toast.error("Error while creating brand");
        },
      },
    );
  };

  return (
    <motion.div
      key="create-brand-process"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex justify-center items-center w-full min-h-screen">
      <div className="flex flex-col items-center justify-center w-[60%] gap-10">
        <div className="flex flex-col gap-7 w-full">
          <h1 className="text-6xl font-bold text-center">
            Create your new brand
          </h1>
          <p className="text-lg opacity-50 -mt-2 text-center">
            Give your brand some details and start managing and integrating web3
            native plugins in your stream.
            <br />
            Don&apos;t worry, you can always change these details later
          </p>
        </div>

        <div className="flex flex-col gap-20 w-[70%]">
          <div className="flex flex-col gap-10 w-full">
            <div className="flex flex-col justify-start items-start gap-2.5 w-full">
              {/* Label */}
              <div className="flex justify-start items-center gap-2.5">
                <Signature className="size-5" />
                <p className="text-base font-bold">Brand Name</p>
              </div>

              <div className="flex w-full justify-start items-center gap-2.5 rounded-full border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white transition-all duration-300">
                <input
                  type="text"
                  placeholder="Your brand's name here..."
                  disabled={isCreatingNewBrand}
                  className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-base"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-14">
              <div className="flex flex-col justify-start items-start gap-2.5 w-full">
                {/* Label and edit button */}
                <div className="flex justify-between items-center w-full">
                  <div className="flex justify-start items-center gap-2.5">
                    <Text className="size-5" />
                    <p className="text-base font-bold">
                      Description (200 chars)
                    </p>
                  </div>
                </div>

                {/* Text description area */}
                <div className="flex flex-col w-full justify-center items-start">
                  <Textarea
                    placeholder="Your livestream description here..."
                    disabled={isCreatingNewBrand}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value.slice(0, 200));
                    }}
                    className="w-full h-[155px] rounded-[12px] border-[1px] border-accent p-2.5 bg-white text-base focus-visible:ring-accent/40 focus-visible:ring-[2px] disabled:opacity-100 disabled:cursor-default resize-none transition-all duration-300"
                  />
                  <p className="text-xs text-muted-foreground mt-[1px] ml-1">
                    {description.length}/200 characters
                  </p>
                </div>
              </div>
              <FileUpload
                label="Logo"
                brandLogoUrl={logoUrl}
                isUpdatingDatabase={isCreatingNewBrand}
                handleUpdateDatabase={(data, onSuccess, onError) => {
                  if (data) {
                    setLogoUrl(data);
                    onSuccess?.();
                  } else {
                    onError?.();
                  }
                }}
              />
            </div>
          </div>

          <NBButton
            className="bg-success h-[42px] w-full"
            disabled={
              isCreatingNewBrand || !brandName || !logoUrl || !description
            }
            onClick={handleCreateBrand}>
            <AnimatePresence mode="wait">
              {isCreatingNewBrand ? (
                <motion.div
                  key="creating-brand-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-white animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="create-brand-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <p className="text-base font-bold text-white">Create Brand</p>
                </motion.div>
              )}
            </AnimatePresence>
          </NBButton>
        </div>
      </div>
    </motion.div>
  );
};
