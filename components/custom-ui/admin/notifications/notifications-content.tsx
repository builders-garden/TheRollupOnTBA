import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NotificationsTabs } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { CTSButton } from "../../cts-button";
import { AdminTabs } from "../admin-tabs";
import { HistoryContent } from "./history/history-content";
import { SendContent } from "./send/send-content";

export const NotificationsContent = () => {
  // Brand tabs states
  const [selectedTab, setSelectedTab] = useState<NotificationsTabs>(
    NotificationsTabs.SEND,
  );

  // Whether the tab is send or history
  const isSendTab = selectedTab === NotificationsTabs.SEND;
  const isHistoryTab = selectedTab === NotificationsTabs.HISTORY;

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
            label: "Send",
            onClick: () => setSelectedTab(NotificationsTabs.SEND),
            isSelected: isSendTab,
          },
          {
            label: "History",
            onClick: () => setSelectedTab(NotificationsTabs.HISTORY),
            isSelected: isHistoryTab,
          },
        ]}
      />

      {/* Brand Content */}
      <AnimatePresence mode="wait">
        {isSendTab && <SendContent key="send" />}
        {isHistoryTab && <HistoryContent key="history" />}
      </AnimatePresence>
    </motion.div>
  );
};
