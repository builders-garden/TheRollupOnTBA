import { Globe, Twitch, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
        <h1 className="text-sm font-bold">{label}</h1>
        <div className="flex justify-end items-center gap-2.5">
          {youtubeUrl && (
            <Link href={youtubeUrl} target="_blank">
              <Youtube className="size-5" />
            </Link>
          )}
          {twitchUrl && (
            <Link href={twitchUrl} target="_blank">
              <Twitch className="size-5" />
            </Link>
          )}
          {twitterUrl && (
            <Link href={twitterUrl} target="_blank">
              <Image src="/socials/x_logo.svg" alt="X" width={16} height={16} />
            </Link>
          )}
          {websiteUrl && (
            <Link href={websiteUrl} target="_blank">
              <Globe className="size-5" />
            </Link>
          )}
        </div>
      </div>
      <p className="text-xs">{text}</p>
    </div>
  );
};
