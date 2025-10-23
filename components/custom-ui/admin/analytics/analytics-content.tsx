import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AnalyticsTabs } from "@/lib/enums";
import { AdminTabs } from "../admin-tabs";
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
      <AdminTabs
        tabButtons={[
          {
            label: "Tips",
            onClick: () => setSelectedTab(AnalyticsTabs.TIPS),
            isSelected: isTipsTab,
          },
          {
            label: "Polls",
            onClick: () => setSelectedTab(AnalyticsTabs.POLLS),
            isSelected: isPollsTab,
          },
        ]}
      />

      {/* Brand Content */}
      <AnimatePresence mode="wait">
        {isTipsTab && <TipsContent key="tips" />}
        {isPollsTab && <PollsContent key="polls" />}
      </AnimatePresence>
    </motion.div>
  );
};
