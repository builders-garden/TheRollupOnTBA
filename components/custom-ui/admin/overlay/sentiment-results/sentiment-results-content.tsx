import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NBButton } from "@/components/custom-ui/nb-button";
import { PollNotification } from "@/components/custom-ui/poll-notification";
import { AVAILABLE_POPUP_POSITIONS } from "@/lib/constants";
import { PopupPositions } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const SentimentResultsContent = () => {
  const [selectedPopupPosition, setSelectedPopupPosition] =
    useState<PopupPositions>(PopupPositions.TOP_LEFT);
  const [showPoll, setShowPoll] = useState(false);

  const handleTestPollNotification = () => {
    setShowPoll((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-2.5">
      <h1 className="font-bold text-[24px]">
        Reveal results from bull-meter sentiment polls
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
          <div className="flex flex-col justify-center items-start w-[80%] gap-2.5">
            <p className="text-[16px] font-medium opacity-50">
              Test by clicking the button below
            </p>
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <NBButton className="w-full shrink-0">
                <p className="text-[16px] font-extrabold text-accent">
                  Show Prompt
                </p>
              </NBButton>
              <NBButton className="w-full shrink-0">
                <p className="text-[16px] font-extrabold text-accent">
                  Reveal Results
                </p>
              </NBButton>
              <NBButton
                className="w-full shrink-0"
                onClick={handleTestPollNotification}>
                <p className="text-[16px] font-extrabold text-accent">
                  Test Poll Notification
                </p>
              </NBButton>
            </div>
          </div>
        </div>

        {/* Overlay Preview */}
        <div className="flex flex-col justify-center items-start aspect-video h-full gap-2.5 border-border border-[2px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {showPoll && (
              <PollNotification
                slideOffset={100}
                data={{
                  id: "1",
                  pollQuestion: "ETH will flip BTC this cycle",
                  timeLeft: "4:27",
                  votes: 10,
                  voters: 10,
                  qrCodeUrl: "https://example.com/poll",
                }}
                previousData={null}
                isTransitioning={false}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
