import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AdminPageTab } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { NBButton } from "../../nb-button";
import { SentimentContent } from "./sentiment/sentiment-content";
import { TipsContent } from "./tips/tips-content";
import { TokensContent } from "./tokens/tokens-conent";

export const PluginsContent = () => {
  const [selectedTab, setSelectedTab] = useState<AdminPageTab>(
    AdminPageTab.SENTIMENT,
  );

  // Whether the tab is tips, tokens, or sentiments
  const isTipsTab = selectedTab === AdminPageTab.TIPS;
  const isTokensTab = selectedTab === AdminPageTab.TOKENS;
  const isSentimentTab = selectedTab === AdminPageTab.SENTIMENT;

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
          onClick={() => setSelectedTab(AdminPageTab.TIPS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isTipsTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-[20px] font-bold">Tips</p>
          </div>
        </NBButton>
        <NBButton
          className={cn("rounded-full w-fit", isSentimentTab && "bg-accent")}
          variant={isSentimentTab ? "default" : "outline"}
          showShadow={isSentimentTab}
          onClick={() => setSelectedTab(AdminPageTab.SENTIMENT)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isSentimentTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-[20px] font-bold">Sentiment</p>
          </div>
        </NBButton>
        <NBButton
          className={cn("rounded-full w-fit", isTokensTab && "bg-accent")}
          variant={isTokensTab ? "default" : "outline"}
          showShadow={isTokensTab}
          onClick={() => setSelectedTab(AdminPageTab.TOKENS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isTokensTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-[20px] font-bold">Tokens</p>
          </div>
        </NBButton>
      </div>

      {/* Plugins Content */}
      <AnimatePresence mode="wait">
        {isTipsTab && <TipsContent key="tips" />}
        {isSentimentTab && <SentimentContent key="sentiment" />}
        {isTokensTab && <TokensContent key="tokens" />}
      </AnimatePresence>
    </motion.div>
  );
};
