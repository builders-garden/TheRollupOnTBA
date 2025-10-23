import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { OverlayTabs } from "@/lib/enums";
import { AdminTabs } from "../admin-tabs";
import { PopupsContent } from "./popups/popups-content";

export const OverlayContent = () => {
  const [selectedTab, setSelectedTab] = useState<OverlayTabs>(
    OverlayTabs.POPUPS,
  );

  // Whether the tab is popups
  const isPopupsTab = selectedTab === OverlayTabs.POPUPS;

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
            label: "Popups",
            onClick: () => setSelectedTab(OverlayTabs.POPUPS),
            isSelected: isPopupsTab,
          },
        ]}
      />

      {/* Plugins Content */}
      <AnimatePresence mode="wait">
        {isPopupsTab && <PopupsContent key="popups" />}
      </AnimatePresence>
    </motion.div>
  );
};
