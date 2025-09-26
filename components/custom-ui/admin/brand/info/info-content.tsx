import { Globe, Podcast, Signature, Twitch, Youtube } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useUpdateBrand } from "@/hooks/use-brands";
import { UpdateBrand } from "@/lib/database/db.schema";
import { SocialMedias, SocialMediaUrls } from "@/lib/types/shared.type";
import { FileUpload } from "./file-upload";
import { NBTextInput } from "./nb-text-input";
import { TextDescriptionArea } from "./text-description-area";

export const InfoContent = () => {
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

  // Normalize YouTube URLs to embed format
  const normalizeYouTubeEmbedUrl = useCallback((inputUrl: string) => {
    try {
      const trimmed = (inputUrl || "").trim();
      if (!trimmed) return "";
      // Handle a leading '@' accidentally pasted before the URL
      const sanitized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

      const url = new URL(sanitized);
      const host = url.hostname.toLowerCase();
      let videoId = "";

      if (host.includes("youtu.be")) {
        // https://youtu.be/<id>
        videoId = url.pathname.split("/").filter(Boolean)[0] || "";
      } else if (
        host.includes("youtube.com") ||
        host.includes("youtube-nocookie.com") ||
        host.includes("m.youtube.com")
      ) {
        const path = url.pathname;
        const parts = path.split("/").filter(Boolean);
        if (path === "/watch") {
          // https://www.youtube.com/watch?v=<id>
          videoId = url.searchParams.get("v") || "";
        } else if (parts[0] === "live" && parts[1]) {
          // https://www.youtube.com/live/<id>
          videoId = parts[1];
        } else if (parts[0] === "embed" && parts[1]) {
          // Already embed format
          videoId = parts[1];
        } else if (parts[0] === "shorts" && parts[1]) {
          // https://www.youtube.com/shorts/<id>
          videoId = parts[1];
        }
      }

      if (!videoId) return sanitized; // If not recognized, keep original
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return inputUrl; // If not a valid URL, keep as-is
    }
  }, []);

  // A list of all the social links
  const socialLinks = [
    {
      key: "yt-live-url",
      label: "Youtube Live URL",
      icon: <Youtube className="size-5" />,
      inputColor: "destructive",
      placeholder: "https://www.youtube.com/livestream",
      value: youtubeLiveUrl,
      setValue: setYoutubeLiveUrl,
    },
    {
      key: "yt-channel-url",
      label: "Youtube",
      icon: <Youtube className="size-5" />,
      placeholder: "https://www.youtube.com/@username",
      value: youtubeChannelUrl,
      setValue: setYoutubeChannelUrl,
    },
    {
      key: "twitch-channel-url",
      label: "Twitch",
      icon: <Twitch className="size-5" />,
      placeholder: "https://twitch.tv/@username",
      value: twitchChannelUrl,
      setValue: setTwitchChannelUrl,
    },
    {
      key: "x-url",
      label: "",
      icon: <Image src="/socials/x_logo.svg" alt="X" width={18} height={18} />,
      placeholder: "https://x.com/username",
      value: xUrl,
      setValue: setXUrl,
    },
    {
      key: "website-url",
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
        // Normalize YouTube Live URL before saving
        if (field === "youtubeLiveUrl") {
          const normalized = normalizeYouTubeEmbedUrl(String(updateData || ""));
          dataToUpdate = normalized;
        }
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
            { brandSlug: brandData.slug, [field]: dataToUpdate },
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
    [brandData, normalizeYouTubeEmbedUrl],
  );

  // Wrapper to update state with normalized value and persist to DB
  const updateYouTubeLiveUrl = useCallback(
    (rawUrl?: string, onSuccess?: () => void, onError?: () => void) => {
      const normalized = normalizeYouTubeEmbedUrl(String(rawUrl || ""));
      setYoutubeLiveUrl(normalized);
      handleUpdateBrandField("youtubeLiveUrl")(normalized, onSuccess, onError);
    },
    [handleUpdateBrandField, normalizeYouTubeEmbedUrl],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
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
        <FileUpload
          label="Logo"
          brandLogoUrl={brandData?.logoUrl}
          handleUpdateDatabase={handleUpdateBrandField("logoUrl")}
          isUpdatingDatabase={isUpdatingBrand}
        />
        <FileUpload
          label="Cover Image"
          brandLogoUrl={brandData?.coverUrl}
          handleUpdateDatabase={handleUpdateBrandField("coverUrl")}
          isUpdatingDatabase={isUpdatingBrand}
        />
      </div>
      <div className="grid grid-cols-4 gap-5 w-full">
        <TextDescriptionArea
          description={description}
          setDescription={setDescription}
          onConfirm={handleUpdateBrandField("description")}
          isUpdating={isUpdatingBrand}
        />
      </div>
      <div className="grid grid-cols-4 gap-5 w-full">
        {socialLinks.map((link) => (
          <NBTextInput
            key={link.key}
            label={link.label}
            inputColor={link.inputColor as "accent" | "destructive"}
            icon={link.icon}
            placeholder={link.placeholder}
            value={link.value}
            setValue={link.setValue}
            isUpdating={isUpdatingBrand}
            onConfirm={
              link.key === "yt-live-url"
                ? updateYouTubeLiveUrl
                : link.key === "yt-channel-url"
                  ? handleUpdateBrandField("socialMediaUrls", "youtube")
                  : link.key === "twitch-channel-url"
                    ? handleUpdateBrandField("socialMediaUrls", "twitch")
                    : link.key === "x-url"
                      ? handleUpdateBrandField("socialMediaUrls", "x")
                      : link.key === "website-url"
                        ? handleUpdateBrandField("websiteUrl")
                        : handleUpdateBrandField("youtubeLiveUrl")
            }
          />
        ))}
      </div>
    </motion.div>
  );
};
