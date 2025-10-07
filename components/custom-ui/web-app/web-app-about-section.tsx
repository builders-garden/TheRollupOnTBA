import { ChevronDownIcon, Globe, Twitch, Youtube } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion";
import { THE_ROLLUP_HOSTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HostsSection } from "../mini-app/hosts";

interface LinksProps {
  youtubeUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  className?: string;
}

// A component that displays the links to the social media platforms
const Links = ({
  youtubeUrl,
  twitchUrl,
  twitterUrl,
  websiteUrl,
  className,
}: LinksProps) => {
  return (
    <div
      className={cn(
        "flex justify-end items-center gap-3.5 shrink-0",
        className,
      )}>
      {youtubeUrl && (
        <Link
          href={youtubeUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Youtube className="size-7" strokeWidth={1.8} />
        </Link>
      )}
      {twitchUrl && (
        <Link
          href={twitchUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Twitch className="size-6" />
        </Link>
      )}
      {twitterUrl && (
        <Link
          href={twitterUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Image src="/socials/x_logo.svg" alt="X" width={20} height={20} />
        </Link>
      )}
      {websiteUrl && (
        <Link
          href={websiteUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Globe className="size-6" />
        </Link>
      )}
    </div>
  );
};

interface WebAppAboutSectionProps {
  label: string;
  text: string;
  coverUrl?: string;
  youtubeUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  brandSlug?: string;
}

export const WebAppAboutSection = ({
  label,
  text,
  coverUrl,
  youtubeUrl,
  twitchUrl,
  twitterUrl,
  websiteUrl,
  brandSlug,
}: WebAppAboutSectionProps) => {
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined,
  );

  if (!text && !coverUrl) {
    return (
      <Links
        youtubeUrl={youtubeUrl}
        twitchUrl={twitchUrl}
        twitterUrl={twitterUrl}
        websiteUrl={websiteUrl}
        className="w-full"
      />
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionValue}
      onValueChange={setAccordionValue}>
      <AccordionItem value="item-1">
        <AccordionTrigger className="w-full cursor-pointer" hideChevron>
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-start items-center gap-2.5 w-full">
              <h1 className="text-lg font-bold">{label}</h1>
              <motion.div
                initial={{ rotate: 180 }}
                animate={{ rotate: !!accordionValue ? 180 : 0 }}
                transition={{ duration: 0.2 }}>
                <ChevronDownIcon className="text-muted-foreground size-6 shrink-0" />
              </motion.div>
            </div>
            <Links
              youtubeUrl={youtubeUrl}
              twitchUrl={twitchUrl}
              twitterUrl={twitterUrl}
              websiteUrl={websiteUrl}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-row justify-between items-start w-full gap-10 mt-2 focus-visible:outline-none">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Cover"
              className="w-[46%] min-h-[270px] object-cover rounded-[12px]"
              width={1000}
              height={200}
            />
          )}
          <div className="flex flex-1 flex-col justify-between items-start w-full min-h-[270px]">
            {text && (
              <div className="flex flex-col justify-start items-start gap-2">
                <h1 className="text-lg font-bold">What happens here?</h1>
                <p className="text-lg w-full text-start">{text}</p>
              </div>
            )}

            {/* TODO: Make this dynamic */}
            {brandSlug === "the_rollup" && (
              <HostsSection
                hosts={THE_ROLLUP_HOSTS}
                label="Hosts"
                labelClassName="text-lg font-bold"
                hostNameClassName="text-sm font-bold"
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
