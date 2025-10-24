import { ChevronDownIcon, Globe, Send, Twitch, Youtube } from "lucide-react";
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
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";

interface MiniAppAboutSectionProps {
  label: string;
  text: string;
  coverUrl?: string;
  youtubeUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  brandSlug?: string;
}

export const MiniAppAboutSection = ({
  label,
  text,
  coverUrl,
  youtubeUrl,
  twitchUrl,
  twitterUrl,
  websiteUrl,
  telegramUrl,
  brandSlug,
}: MiniAppAboutSectionProps) => {
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined,
  );

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
              <h1 className="text-sm font-bold">{label}</h1>
              <motion.div
                initial={{ rotate: 180 }}
                animate={{ rotate: !!accordionValue ? 180 : 0 }}
                transition={{ duration: 0.2 }}>
                <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" />
              </motion.div>
            </div>
            <div className="flex justify-end items-center gap-2.5 shrink-0">
              {youtubeUrl && (
                <Link
                  href={youtubeUrl}
                  target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <Youtube className="size-[21px]" strokeWidth={1.8} />
                </Link>
              )}
              {twitchUrl && (
                <Link
                  href={twitchUrl}
                  target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <Twitch className="size-4.5" />
                </Link>
              )}
              {twitterUrl && (
                <Link
                  href={twitterUrl}
                  target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <Image
                    src={
                      brandSlug === THE_ROLLUP_BRAND_SLUG
                        ? "/socials/x_logo_black.svg"
                        : "/socials/x_logo_white.svg"
                    }
                    alt="X"
                    width={15}
                    height={15}
                  />
                </Link>
              )}
              {websiteUrl && (
                <Link
                  href={websiteUrl}
                  target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <Globe className="size-4.5" />
                </Link>
              )}
              {telegramUrl && (
                <Link
                  href={telegramUrl}
                  target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <Send className="size-4.5" />
                </Link>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="w-full space-y-3">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Cover"
              className="w-full object-cover rounded-[12px]"
              width={1000}
              height={200}
            />
          )}
          <p className="text-xs">{text}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
