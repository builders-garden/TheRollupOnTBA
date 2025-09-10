import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { ToastNotification } from "@/components/custom-ui/toast/toast-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { AVAILABLE_POPUP_POSITIONS } from "@/lib/constants";
import { PopupPositions } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const PopupsContent = () => {
  useSocket();
  const { joinStream, tipSent, tokenTraded, voteCasted } = useSocketUtils();
  const [selectedPopupPosition, setSelectedPopupPosition] =
    useState<PopupPositions>(PopupPositions.TOP_LEFT);

  const handleTestNotification = (type: "tip" | "trade" | "vote") => {
    const testData = {
      username: "TestUser",
      profilePicture: "https://picsum.photos/200",
      text:
        type === "tip" ? "$5 tip" : type === "trade" ? "$100 trade" : "vote",
    };
    const isRightSide =
      selectedPopupPosition === PopupPositions.TOP_RIGHT ||
      selectedPopupPosition === PopupPositions.BOTTOM_RIGHT;
    const slideOffset = isRightSide ? 100 : -100;

    toast.custom(
      () => <ToastNotification data={testData} slideOffset={slideOffset} />,
      {
        duration: 2000,
        position: selectedPopupPosition,
      },
    );
    if (type === "tip") {
      tipSent({
        position: selectedPopupPosition,
        username: testData.username,
        profilePicture: testData.profilePicture,
        tipAmount: "5",
      });
    } else if (type === "trade") {
      tokenTraded({
        position: selectedPopupPosition,
        username: testData.username,
        profilePicture: testData.profilePicture,
        tokenInAmount: "5",
        tokenInName: "ETH",
        tokenInDecimals: 18,
        tokenInImageUrl: "https://via.placeholder.com/150",
        tokenOutAmount: "100",
        tokenOutDecimals: 18,
        tokenOutName: "BTC",
        tokenOutImageUrl: "https://via.placeholder.com/150",
      });
    } else if (type === "vote") {
      voteCasted({
        position: selectedPopupPosition,
        username: testData.username,
        profilePicture: testData.profilePicture,
        voteAmount: "5",
        isBull: true,
        promptId: "1",
      });
    }
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
        Display animated popups on stream whenever viewers tip, trade, or vote
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
          <div className="flex flex-col justify-center items-start w-[70%] gap-2.5">
            <p className="text-base font-medium opacity-50">
              Test popups by clicking the buttons below
            </p>
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <NBButton
                className="w-full shrink-0"
                onClick={() => handleTestNotification("tip")}>
                <p className="text-base font-extrabold text-accent">Tip</p>
              </NBButton>
              <NBButton
                className="w-full shrink-0"
                onClick={() => handleTestNotification("trade")}>
                <p className="text-base font-extrabold text-accent">Trade</p>
              </NBButton>
              <NBButton
                className="w-full shrink-0"
                onClick={() => handleTestNotification("vote")}>
                <p className="text-base font-extrabold text-accent">Vote</p>
              </NBButton>
            </div>
          </div>
        </div>

        {/* Note: Toasts render at the viewport edge using Sonner. Use buttons above to test. */}
      </div>
    </motion.div>
  );
};
