import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PluginsTabs } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { NBButton } from "../../nb-button";
import { SentimentContent } from "./sentiment/sentiment-content";
import { TipsContent } from "./tips/tips-content";
import { TokensContent } from "./tokens/tokens-conent";

export const PluginsContent = ({ brandId }: { brandId: string }) => {
  const [selectedTab, setSelectedTab] = useState<PluginsTabs>(PluginsTabs.TIPS);

  // Whether the tab is tips, tokens, or sentiments
  const isTipsTab = selectedTab === PluginsTabs.TIPS;
  const isTokensTab = selectedTab === PluginsTabs.TOKENS;
  const isSentimentTab = selectedTab === PluginsTabs.SENTIMENT;

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
          className={cn("rounded-full w-fit", isTipsTab && "bg-accent")}
          variant={isTipsTab ? "default" : "outline"}
          showShadow={isTipsTab}
          onClick={() => setSelectedTab(PluginsTabs.TIPS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isTipsTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Tips</p>
          </div>
        </NBButton>
        <NBButton
          className={cn("rounded-full w-fit", isSentimentTab && "bg-accent")}
          variant={isSentimentTab ? "default" : "outline"}
          showShadow={isSentimentTab}
          onClick={() => setSelectedTab(PluginsTabs.SENTIMENT)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isSentimentTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Sentiment</p>
          </div>
        </NBButton>
        <NBButton
          className={cn("rounded-full w-fit", isTokensTab && "bg-accent")}
          variant={isTokensTab ? "default" : "outline"}
          showShadow={isTokensTab}
          onClick={() => setSelectedTab(PluginsTabs.TOKENS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isTokensTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Tokens</p>
          </div>
        </NBButton>
      </div>

      {/* Plugins Content */}
      <AnimatePresence mode="wait">
        {isTipsTab && <TipsContent key="tips" />}
        {isSentimentTab && (
          <SentimentContent key="sentiment" brandId={brandId} />
        )}
        {isTokensTab && <TokensContent key="tokens" />}
      </AnimatePresence>
    </motion.div>
  );
};
