import { motion } from "motion/react";
import { useState } from "react";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NotificationContainer } from "@/components/custom-ui/notification-container";
import { useNotificationQueue } from "@/contexts/notification-queue-context";
import { AVAILABLE_POPUP_POSITIONS } from "@/lib/constants";
import { PopupPositions } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const PopupsContent = () => {
  const [selectedPopupPosition, setSelectedPopupPosition] =
    useState<PopupPositions>(PopupPositions.TOP_LEFT);
  const { addToQueue } = useNotificationQueue();

  const handleTestNotification = (type: "tip" | "trade" | "vote") => {
    const testData = {
      username: "TestUser",
      profilePicture: "https://picsum.photos/200",
      text:
        type === "tip" ? "$5 tip" : type === "trade" ? "$100 trade" : "vote",
    };
    addToQueue(testData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-2.5">
      <h1 className="font-bold text-[24px]">
        Display animated popups on stream whenever viewers tip, trade, or vote
      </h1>
      <div className="flex flex-col justify-center items-start w-full h-full gap-5">
        {/* Buttons */}
        <div className="flex justify-start items-start w-[60%] gap-10">
          <div className="flex flex-col justify-center items-start w-full gap-2.5">
            <p className="text-[16px] font-medium opacity-50">
              Choose where popups appear by selecting a screen position.
            </p>
            <div className="grid grid-cols-3 gap-2.5 w-full">
              {AVAILABLE_POPUP_POSITIONS.map((position) => (
                <NBButton
                  key={position.value}
                  className={cn(
                    "w-full shrink-0",
                    selectedPopupPosition === position.value && "bg-success",
                  )}
                  onClick={() => setSelectedPopupPosition(position.value)}>
                  <p
                    className={cn(
                      "text-[16px] font-extrabold text-success",
                      selectedPopupPosition === position.value && "text-white",
                    )}>
                    {position.label}
                  </p>
                </NBButton>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-[70%] gap-2.5">
            <p className="text-[16px] font-medium opacity-50">
              Test popups by clicking the buttons below
            </p>
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <NBButton
                className="w-full shrink-0"
                onClick={() => handleTestNotification("tip")}>
                <p className="text-[16px] font-extrabold text-accent">Tip</p>
              </NBButton>
              <NBButton
                className="w-full shrink-0"
                onClick={() => handleTestNotification("trade")}>
                <p className="text-[16px] font-extrabold text-accent">Trade</p>
              </NBButton>
              <NBButton
                className="w-full shrink-0"
                onClick={() => handleTestNotification("vote")}>
                <p className="text-[16px] font-extrabold text-accent">Vote</p>
              </NBButton>
            </div>
          </div>
        </div>

        {/* Overlay Preview */}
        <div className="relative flex flex-col justify-center items-start aspect-video h-full gap-2.5 border-border border-[2px] bg-gray-100/20 overflow-hidden">
          <div
            className={cn(
              "absolute w-full h-full",
              selectedPopupPosition === PopupPositions.TOP_LEFT &&
                "flex justify-start items-start p-4",
              selectedPopupPosition === PopupPositions.TOP_CENTER &&
                "flex justify-center items-start p-4",
              selectedPopupPosition === PopupPositions.TOP_RIGHT &&
                "flex justify-end items-start p-4",
              selectedPopupPosition === PopupPositions.BOTTOM_LEFT &&
                "flex justify-start items-end p-4",
              selectedPopupPosition === PopupPositions.BOTTOM_CENTER &&
                "flex justify-center items-end p-4",
              selectedPopupPosition === PopupPositions.BOTTOM_RIGHT &&
                "flex justify-end items-end p-4",
            )}>
            <NotificationContainer position={selectedPopupPosition} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
