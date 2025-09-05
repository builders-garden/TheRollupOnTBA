import { Globe, Sparkle, Twitch, Twitter, X, Youtube } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { NBButton } from "../../nb-button";
import { FileUpload } from "./file-upload";
import { NBTextInput } from "./nb-text-input";
import { TextDescriptionArea } from "./text-description-area";

export const BrandContent = () => {
  // Social links states
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState("");
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState("");
  const [twitchChannelUrl, setTwitchChannelUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Text area description state
  const [description, setDescription] = useState("");

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
          <div className="flex justify-start items-center w-full gap-2">
            <Sparkle className="size-6" />
            <p className="text-[20px] font-bold">Hello</p>
          </div>
        </NBButton>
      </div>

      {/* Brand Content */}
      <div className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
        <h1 className="font-bold text-[24px]">
          Set up your brand identity with a logo and social links for viewers to
          see during your stream
        </h1>
        <div className="grid grid-cols-4 gap-5 w-full">
          <FileUpload />
          <TextDescriptionArea
            description={description}
            setDescription={setDescription}
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
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
