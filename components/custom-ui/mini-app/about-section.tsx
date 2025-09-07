import { Globe, Twitch, Twitter, Youtube } from "lucide-react";
import { motion } from "motion/react";

interface AboutSectionProps {
  label: string;
  text: string;
  youtubeUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

export const AboutSection = ({
  label,
  text,
  youtubeUrl,
  twitchUrl,
  twitterUrl,
  websiteUrl,
}: AboutSectionProps) => {
  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-[14px] font-bold">{label}</h1>
        <div className="flex justify-end items-center gap-2.5">
          {youtubeUrl && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(youtubeUrl, "_blank")}>
              <Youtube className="size-5" />
            </motion.button>
          )}
          {twitchUrl && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(twitchUrl, "_blank")}>
              <Twitch className="size-5" />
            </motion.button>
          )}
          {twitterUrl && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(twitterUrl, "_blank")}>
              <Twitter className="size-5" />
            </motion.button>
          )}
          {websiteUrl && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(websiteUrl, "_blank")}>
              <Globe className="size-5" />
            </motion.button>
          )}
        </div>
      </div>
      <p className="text-[13px]">{text}</p>
    </div>
  );
};
