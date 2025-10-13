import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NotificationsTabs } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { NBButton } from "../../nb-button";
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
      <div className="flex justify-start items-center w-full py-5 px-2.5 gap-5 border-b-[1px] border-border">
        <NBButton
          className={cn("rounded-full w-fit", isSendTab && "bg-accent")}
          variant={isSendTab ? "default" : "outline"}
          showShadow={isSendTab}
          onClick={() => setSelectedTab(NotificationsTabs.SEND)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isSendTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Send</p>
          </div>
        </NBButton>
        <NBButton
          className={cn("rounded-full w-fit", isHistoryTab && "bg-accent")}
          variant={isHistoryTab ? "default" : "outline"}
          showShadow={isHistoryTab}
          onClick={() => setSelectedTab(NotificationsTabs.HISTORY)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isHistoryTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">History</p>
          </div>
        </NBButton>
      </div>

      {/* Brand Content */}
      <AnimatePresence mode="wait">
        {isSendTab && <SendContent key="send" />}
        {isHistoryTab && <HistoryContent key="history" />}
      </AnimatePresence>
    </motion.div>
  );
};
