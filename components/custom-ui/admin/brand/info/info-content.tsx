import { Globe, Send, Signature, Twitch, Youtube } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useUpdateBrand } from "@/hooks/use-brands";
import {
  BrandSocialDatabaseProperty,
  UpdateBrand,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { CTSTextInput } from "./cts-text-input";
import { FileUpload } from "./file-upload";
import { TextDescriptionArea } from "./text-description-area";

interface BrandSocialFields {
  key: BrandSocialDatabaseProperty;
  label: string;
  icon: React.ReactNode;
  inputColor?: "accent" | "destructive";
  placeholder: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  infoLink?: string;
  infoLinkText?: string;
  infoLinkClassName?: string;
}

export const InfoContent = () => {
  const { brand } = useAdminAuth();
  const brandData = useMemo(() => brand.data, [brand.data]);
  const { mutate: updateBrand, isPending: isUpdatingBrand } = useUpdateBrand(
    AuthTokenType.ADMIN_AUTH_TOKEN,
  );

  const [brandName, setBrandName] = useState(brandData?.name || "");
  const [youtubeChannelId, setYoutubeChannelId] = useState(
    brandData?.youtubeChannelId || "",
  );

  // Social links states
  const [twitchUrl, setTwitchUrl] = useState(brandData?.twitchUrl || "");
  const [xUrl, setXUrl] = useState(brandData?.xUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(brandData?.websiteUrl || "");
  const [telegramUrl, setTelegramUrl] = useState(brandData?.telegramUrl || "");

  // Text area description state
  const [description, setDescription] = useState(brandData?.description || "");

  // A list of all the social fields
  const socialFields: BrandSocialFields[] = [
    {
      key: "youtubeChannelId",
      label: "Youtube Channel ID",
      icon: <Youtube className="size-5" />,
      inputColor: "destructive",
      placeholder: "e.g. UCC2UPtxxxxxxxxxxUPZJ6g",
      value: youtubeChannelId,
      setValue: setYoutubeChannelId,
      infoLink: "https://support.google.com/youtube/answer/3250431?hl=en",
      infoLinkText: "How to get it?",
      infoLinkClassName: "text-muted-foreground",
    },
    {
      key: "twitchUrl",
      label: "Twitch",
      icon: <Twitch className="size-5" />,
      placeholder: "https://twitch.tv/@username",
      value: twitchUrl,
      setValue: setTwitchUrl,
      infoLink: undefined,
      infoLinkText: undefined,
      infoLinkClassName: undefined,
    },
    {
      key: "xUrl",
      label: "",
      icon: (
        <Image src="/socials/x_logo_white.svg" alt="X" width={18} height={18} />
      ),
      placeholder: "https://x.com/username",
      value: xUrl,
      setValue: setXUrl,
      infoLink: undefined,
      infoLinkText: undefined,
      infoLinkClassName: undefined,
    },
    {
      key: "websiteUrl",
      label: "Website",
      icon: <Globe className="size-5" />,
      placeholder: "https://example.com/",
      value: websiteUrl,
      setValue: setWebsiteUrl,
      infoLink: undefined,
      infoLinkText: undefined,
      infoLinkClassName: undefined,
    },
    {
      key: "telegramUrl",
      label: "Telegram",
      icon: <Send className="size-5" />,
      placeholder: "https://t.me/username",
      value: telegramUrl,
      setValue: setTelegramUrl,
      infoLink: undefined,
      infoLinkText: undefined,
      infoLinkClassName: undefined,
    },
  ];

  // A generic function to update a brand field
  const handleUpdateBrandField = useCallback(
    (field: keyof UpdateBrand) => {
      return (
        updateData: string,
        onSuccess?: () => void,
        onError?: () => void,
      ) => {
        if (!brandData || !brandData?.id) return;
        try {
          updateBrand(
            { brandSlug: brandData.slug, [field]: updateData },
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
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-2xl">
        Set up your brand identity with a logo and social links for viewers to
        see during your stream
      </h1>
      <div className="grid grid-cols-4 gap-5 w-full">
        <CTSTextInput
          label="Brand Name"
          icon={<Signature className="size-5" />}
          placeholder="Your brand's name here..."
          value={brandName}
          setValue={setBrandName}
          onConfirm={handleUpdateBrandField("name")}
          isUpdating={isUpdatingBrand}
        />
        <TextDescriptionArea
          description={description}
          setDescription={setDescription}
          onConfirm={handleUpdateBrandField("description")}
          isUpdating={isUpdatingBrand}
        />
        <FileUpload
          label="Logo (512x512)"
          brandLogoUrl={brandData?.logoUrl}
          handleUpdateDatabase={handleUpdateBrandField("logoUrl")}
          isUpdatingDatabase={isUpdatingBrand}
        />
        <FileUpload
          label="Cover Image (1500x1000)"
          brandLogoUrl={brandData?.coverUrl}
          handleUpdateDatabase={handleUpdateBrandField("coverUrl")}
          isUpdatingDatabase={isUpdatingBrand}
        />
      </div>
      <div className="grid grid-cols-4 gap-5 w-full">
        {socialFields.map((link) => (
          <CTSTextInput
            key={link.key}
            label={link.label}
            inputColor={link.inputColor as "accent" | "destructive"}
            icon={link.icon}
            placeholder={link.placeholder}
            value={link.value}
            setValue={link.setValue}
            isUpdating={isUpdatingBrand}
            infoLink={link.infoLink}
            infoLinkText={link.infoLinkText}
            infoLinkClassName={link.infoLinkClassName}
            onConfirm={handleUpdateBrandField(link.key)}
          />
        ))}
      </div>
    </motion.div>
  );
};
