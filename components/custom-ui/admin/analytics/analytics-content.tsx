import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AnalyticsTabs } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { CTSButton } from "../../cts-button";
import { PollsContent } from "./polls/polls-content";
import { TipsContent } from "./tips/tips-content";

export const AnalyticsContent = () => {
  // Brand tabs states
  const [selectedTab, setSelectedTab] = useState<AnalyticsTabs>(
    AnalyticsTabs.TIPS,
  );

  // Whether the tab is tips or bullmeter votes
  const isTipsTab = selectedTab === AnalyticsTabs.TIPS;
  const isPollsTab = selectedTab === AnalyticsTabs.POLLS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-center w-full">
      {/* Tabs Buttons */}
      <div className="flex justify-start items-center w-full py-5 px-2.5 gap-5 border-b-[1px] border-border">
        <CTSButton
          className={cn("rounded-full w-fit", isTipsTab && "bg-accent")}
          variant={isTipsTab ? "default" : "outline"}
          showShadow={isTipsTab}
          onClick={() => setSelectedTab(AnalyticsTabs.TIPS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isTipsTab && "text-foreground",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Tips</p>
          </div>
        </CTSButton>
        <CTSButton
          className={cn("rounded-full w-fit", isPollsTab && "bg-accent")}
          variant={isPollsTab ? "default" : "outline"}
          showShadow={isPollsTab}
          onClick={() => setSelectedTab(AnalyticsTabs.POLLS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isPollsTab && "text-foreground",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Polls</p>
          </div>
        </CTSButton>
      </div>

      {/* Brand Content */}
      <AnimatePresence mode="wait">
        {isTipsTab && <TipsContent key="tips" />}
        {isPollsTab && <PollsContent key="polls" />}
      </AnimatePresence>
    </motion.div>
  );
};
