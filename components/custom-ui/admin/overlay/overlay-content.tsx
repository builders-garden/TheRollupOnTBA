import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { OverlayTabs } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { NBButton } from "../../nb-button";
import { PopupsContent } from "./popups/popups-content";
import { SentimentResultsContent } from "./sentiment-results/sentiment-results-content";

export const OverlayContent = () => {
  const [selectedTab, setSelectedTab] = useState<OverlayTabs>(
    OverlayTabs.POPUPS,
  );

  // Whether the tab is popups or sentiment results
  const isPopupsTab = selectedTab === OverlayTabs.POPUPS;
  const isSentimentResultsTab = selectedTab === OverlayTabs.SENTIMENT_RESULTS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-center w-full h-full">
      {/* Tabs Buttons */}
      <div className="flex justify-between items-center w-full px-2.5 border-b-[1px] border-border">
        <div className="flex justify-start items-center w-full py-5 gap-5">
          <NBButton
            className={cn("rounded-full w-fit", isPopupsTab && "bg-accent")}
            variant={isPopupsTab ? "default" : "outline"}
            showShadow={isPopupsTab}
            onClick={() => setSelectedTab(OverlayTabs.POPUPS)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                isPopupsTab && "text-white",
              )}>
              <Sparkle className="size-6" />
              <p className="text-xl font-bold">Popups</p>
            </div>
          </NBButton>
        </div>
      </div>

      {/* Plugins Content */}
      <AnimatePresence mode="wait">
        {isPopupsTab && <PopupsContent key="popups" />}
        {isSentimentResultsTab && (
          <SentimentResultsContent key="sentimentResults" />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
