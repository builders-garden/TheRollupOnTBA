import {
  Globe,
  Podcast,
  Signature,
  Sparkle,
  Twitch,
  Twitter,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useUpdateBrand } from "@/hooks/use-brands";
import { UpdateBrand } from "@/lib/database/db.schema";
import { SocialMedias, SocialMediaUrls } from "@/lib/types/shared.type";
import { NBButton } from "../../nb-button";
import { FileUpload } from "./file-upload";
import { NBTextInput } from "./nb-text-input";
import { TextDescriptionArea } from "./text-description-area";

export const BrandContent = () => {
  const { brand } = useAdminAuth();
  const brandData = useMemo(() => brand.data, [brand.data]);
  const { mutate: updateBrand, isPending: isUpdatingBrand } = useUpdateBrand();

  // Social links states
  const [brandName, setBrandName] = useState(brandData?.name || "");
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState(
    brandData?.youtubeLiveUrl || "",
  );
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(
    brandData?.socialMediaUrls?.youtube || "",
  );
  const [twitchChannelUrl, setTwitchChannelUrl] = useState(
    brandData?.socialMediaUrls?.twitch || "",
  );
  const [xUrl, setXUrl] = useState(brandData?.socialMediaUrls?.x || "");
  const [websiteUrl, setWebsiteUrl] = useState(brandData?.websiteUrl || "");
  const [streamTitle, setStreamTitle] = useState(brandData?.streamTitle || "");

  // Text area description state
  const [description, setDescription] = useState(brandData?.description || "");

  // A list of all the social links
  const socialLinks = [
    {
      label: "Youtube Live URL",
      icon: <Youtube className="size-5" />,
      inputColor: "destructive",
      placeholder: "https://www.youtube.com/livestream",
      value: youtubeLiveUrl,
      setValue: setYoutubeLiveUrl,
    },
    {
      label: "Youtube",
      icon: <Youtube className="size-5" />,
      placeholder: "https://www.youtube.com/@username",
      value: youtubeChannelUrl,
      setValue: setYoutubeChannelUrl,
    },
    {
      label: "Twitch",
      icon: <Twitch className="size-5" />,
      placeholder: "https://twitch.tv/@username",
      value: twitchChannelUrl,
      setValue: setTwitchChannelUrl,
    },
    {
      label: "X",
      icon: <Twitter className="size-5" />,
      placeholder: "https://x.com/username",
      value: xUrl,
      setValue: setXUrl,
    },
    {
      label: "Website",
      icon: <Globe className="size-5" />,
      placeholder: "https://example.com/",
      value: websiteUrl,
      setValue: setWebsiteUrl,
    },
  ];

  // A generic function to update a brand field
  const handleUpdateBrandField = useCallback(
    (field: keyof UpdateBrand, socialType?: SocialMedias) => {
      return (
        updateData: string,
        onSuccess?: () => void,
        onError?: () => void,
      ) => {
        if (!brandData || !brandData?.id) return;
        let dataToUpdate: string | SocialMediaUrls = updateData;
        if (field === "socialMediaUrls" && !!socialType) {
          dataToUpdate = {
            youtube: brandData.socialMediaUrls?.youtube || "",
            twitch: brandData.socialMediaUrls?.twitch || "",
            x: brandData.socialMediaUrls?.x || "",
            [socialType]: updateData,
          };
        }
        try {
          updateBrand(
            { brandId: brandData.id, [field]: dataToUpdate },
            {
              onSuccess: async () => {
                await brand.refetch();
                toast.success("Field updated successfully");
                onSuccess?.();
              },
              onError: () => {
                toast.error("Error while updating brand information");
                onError?.();
              },
            },
          );
        } catch (error) {
          toast.error("Error while updating brand information");
        }
      };
    },
    [brandData],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-center w-full">
      {/* Tabs Buttons */}
      <div className="flex justify-start items-center w-full py-5 px-2.5 gap-5 border-b-[1px] border-border">
        <NBButton
          className="rounded-full w-fit bg-accent"
          variant="default"
          onClick={() => {}}>
          <div className="flex justify-start items-center w-full gap-2 text-white">
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Info</p>
          </div>
        </NBButton>
      </div>

      {/* Brand Content */}
      <div className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
        <h1 className="font-bold text-2xl">
          Set up your brand identity with a logo and social links for viewers to
          see during your stream
        </h1>
        <div className="grid grid-cols-4 gap-5 w-full">
          <NBTextInput
            label="Brand Name"
            icon={<Signature className="size-5" />}
            placeholder="Your brand's name here..."
            value={brandName}
            setValue={setBrandName}
            onConfirm={handleUpdateBrandField("name")}
            isUpdating={isUpdatingBrand}
          />
          <NBTextInput
            label="Stream Title"
            icon={<Podcast className="size-5" />}
            placeholder="Your stream title here..."
            value={streamTitle}
            setValue={setStreamTitle}
            onConfirm={handleUpdateBrandField("streamTitle")}
            isUpdating={isUpdatingBrand}
          />
          <TextDescriptionArea
            description={description}
            setDescription={setDescription}
            onConfirm={handleUpdateBrandField("description")}
            isUpdating={isUpdatingBrand}
          />
          <FileUpload
            brandLogoUrl={brandData?.logoUrl}
            handleUpdateDatabase={handleUpdateBrandField("logoUrl")}
            isUpdatingDatabase={isUpdatingBrand}
          />
        </div>
        <div className="grid grid-cols-4 gap-5 w-full">
          {socialLinks.map((link) => (
            <NBTextInput
              key={link.label}
              label={link.label}
              inputColor={link.inputColor as "accent" | "destructive"}
              icon={link.icon}
              placeholder={link.placeholder}
              value={link.value}
              setValue={link.setValue}
              isUpdating={isUpdatingBrand}
              onConfirm={
                link.label === "Youtube"
                  ? handleUpdateBrandField("socialMediaUrls", "youtube")
                  : link.label === "Twitch"
                    ? handleUpdateBrandField("socialMediaUrls", "twitch")
                    : link.label === "X"
                      ? handleUpdateBrandField("socialMediaUrls", "x")
                      : link.label === "Website"
                        ? handleUpdateBrandField("websiteUrl")
                        : handleUpdateBrandField("youtubeLiveUrl")
              }
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
