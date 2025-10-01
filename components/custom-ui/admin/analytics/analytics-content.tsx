import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AnalyticsTabs } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { NBButton } from "../../nb-button";
import { DataContent } from "./data/data-content";

export const AnalyticsContent = () => {
  // Brand tabs states
  const [selectedTab, setSelectedTab] = useState<AnalyticsTabs>(
    AnalyticsTabs.DATA,
  );

  // Whether the tab is info or access
  const isDataTab = selectedTab === AnalyticsTabs.DATA;

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
          className={cn("rounded-full w-fit", isDataTab && "bg-accent")}
          variant={isDataTab ? "default" : "outline"}
          showShadow={isDataTab}
          onClick={() => setSelectedTab(AnalyticsTabs.DATA)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isDataTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Info</p>
          </div>
        </NBButton>
      </div>

      {/* Brand Content */}
      <AnimatePresence mode="wait">
        {isDataTab && <DataContent key="data" />}
      </AnimatePresence>
    </motion.div>
  );
};
