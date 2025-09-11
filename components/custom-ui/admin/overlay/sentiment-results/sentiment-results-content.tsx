import { addSeconds } from "date-fns";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { ToastPollNotification } from "@/components/custom-ui/toast/toast-poll-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { AVAILABLE_POPUP_POSITIONS } from "@/lib/constants";
import { PopupPositions } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const SentimentResultsContent = () => {
  useSocket();
  const {
    joinStream,
    adminStartBullmeter: adminStartSentimentPoll,
    adminEndBullmeter: adminEndSentimentPoll,
  } = useSocketUtils();

  const [selectedPopupPosition, setSelectedPopupPosition] =
    useState<PopupPositions>(PopupPositions.TOP_CENTER);

  const handleTestPollNotification = () => {
    const data = {
      id: "1",
      pollQuestion: "ETH will flip BTC this cycle",
      endTime: addSeconds(new Date(), 5),
      votes: 10,
      voters: 10,
      qrCodeUrl: "https://example.com/poll",
      position: selectedPopupPosition,
      results: {
        bullPercent: 70,
        bearPercent: 30,
      },
    };

    adminStartSentimentPoll({
      id: "1",
      //username: "Admin",
      //profilePicture: "https://via.placeholder.com/150",
      pollQuestion: "ETH will flip BTC this cycle",
      endTime: addSeconds(new Date(), 5),
      position: selectedPopupPosition,
      guests: [],
      results: {
        bullPercent: 70,
        bearPercent: 30,
      },
    });

    toast.custom(() => <ToastPollNotification data={data} />, {
      duration: Infinity,
      position: selectedPopupPosition,
      onDismiss: () => {
        adminEndSentimentPoll({
          id: "1",
          votes: 0,
          voters: 0,
          results: { bullPercent: 0, bearPercent: 0 },
        });
      },
    });
  };

  useEffect(() => {
    joinStream({
      username: "Admin",
      profilePicture: "https://via.placeholder.com/150",
    });
  }, [joinStream]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-2.5">
      <h1 className="font-bold text-2xl">
        Reveal results from bull-meter sentiment polls
      </h1>
      <div className="flex flex-col justify-start items-start w-full h-full gap-5">
        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-start items-start w-full gap-10">
          <div className="flex flex-col justify-center items-start w-full gap-2.5">
            <p className="text-base font-medium opacity-50">
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
                      "text-base font-extrabold text-success",
                      selectedPopupPosition === position.value && "text-white",
                    )}>
                    {position.label}
                  </p>
                </NBButton>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-full gap-2.5">
            <p className="text-base font-medium opacity-50">
              Test by clicking the button below
            </p>
            <NBButton className="w-fit" onClick={handleTestPollNotification}>
              <p className="text-base font-extrabold text-accent">Test Poll</p>
            </NBButton>
          </div>
        </div>
        {/* Note: Toasts render at the viewport edge using Sonner. Use buttons above to test. */}
      </div>
    </motion.div>
  );
};
