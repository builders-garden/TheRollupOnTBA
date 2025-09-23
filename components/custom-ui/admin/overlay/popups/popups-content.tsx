import { addSeconds } from "date-fns";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/custom-ui/copy-button";
import { NBButton } from "@/components/custom-ui/nb-button";
import { ToastNotification } from "@/components/custom-ui/toast/toast-notification";
import { ToastPollNotification } from "@/components/custom-ui/toast/toast-poll-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { PopupPositions } from "@/lib/enums";
import { env } from "@/lib/zod";

export const PopupsContent = () => {
  useSocket();
  const {
    joinStream,
    tipSent,
    tokenTraded,
    voteCasted,
    adminStartBullmeter: adminStartSentimentPoll,
    adminEndBullmeter: adminEndSentimentPoll,
  } = useSocketUtils();
  const [selectedPopupPosition, _] = useState<PopupPositions>(
    PopupPositions.TOP_CENTER,
  );

  const handleTestNotification = (type: "tip" | "trade" | "vote") => {
    const testData = {
      username: "test.base.eth",
      profilePicture: "https://picsum.photos/200",
      text:
        type === "tip"
          ? "sent a $5 tip"
          : type === "trade"
            ? "bought some $HIGHER"
            : "is bullish",
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
        tokenOutName: "ETH",
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
        endTime: addSeconds(new Date(), 5),
      });
    }
  };

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

    setTimeout(() => {
      adminEndSentimentPoll({
        id: "1",
        votes: 0,
        voters: 0,
        results: { bullPercent: 0, bearPercent: 0 },
      });
    }, 2000);

    toast.custom(() => <ToastPollNotification data={data} />, {
      duration: 10000,
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
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-16">
      <div className="flex flex-col justify-start items-start w-full h-fit gap-5">
        <h1 className="font-bold text-2xl">
          Display animated popups on stream whenever viewers tip, trade, or vote
        </h1>
        <div className="flex flex-col justify-start items-start w-full h-full gap-5">
          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-start items-start w-full gap-10">
            <div className="flex flex-col justify-center items-start w-[70%] gap-2.5">
              <p className="text-base font-medium opacity-50">
                Test popups by clicking the buttons below
              </p>
              <div className="grid grid-cols-4 gap-2.5 w-full">
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
                <NBButton
                  className="w-full shrink-0"
                  onClick={handleTestPollNotification}>
                  <p className="text-base font-extrabold text-accent">
                    Bull-Meter Poll
                  </p>
                </NBButton>
              </div>
            </div>
          </div>
          {/* Note: Toasts render at the viewport edge using Sonner. Use buttons above to test. */}
        </div>
      </div>
      <div className="flex flex-col justify-start items-start w-full h-full gap-5">
        <h1 className="font-bold text-2xl">
          How to setup the Overlay on your stream?
        </h1>
        <div className="flex flex-col justify-start items-start gap-1">
          <p className="text-black font-medium">
            <span className="font-bold">1.</span> Copy the URLs below and add
            two Browser Sources to your setup
          </p>
          <div className="flex flex-row justify-start items-start w-full gap-2.5">
            <div className="flex flex-col gap-1">
              <p className="font-medium opacity-50 text-sm">Popups URL</p>
              <div className="flex flex-row justify-start items-start w-full gap-2.5 border-2 rounded-md p-2">
                {`${env.NEXT_PUBLIC_URL}/overlay/popups`}
                <CopyButton
                  key="copy-button"
                  stringToCopy={`${env.NEXT_PUBLIC_URL}/overlay/popups`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium opacity-50 text-sm">
                Bull-meter Poll URL
              </p>
              <div className="flex flex-row justify-start items-start w-full gap-2.5 border-2 rounded-md p-2">
                {`${env.NEXT_PUBLIC_URL}/overlay/sentiment`}
                <CopyButton
                  key="copy-button"
                  stringToCopy={`${env.NEXT_PUBLIC_URL}/overlay/sentiment`}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-1">
          <p className="text-black font-medium">
            <span className="font-bold">2.</span> Set width and height to
            600x150 for popups and 1100x250 for bull-meter poll
          </p>
          <p className="text-sm opacity-50">
            These are suggested sizes, feel free to adjust them to your liking.
          </p>
        </div>
        <div className="flex flex-col justify-start items-start gap-1">
          <p className="text-black font-medium">
            <span className="font-bold">3.</span> Position the source at the top
            of your Sources list
          </p>
        </div>
        <div className="flex flex-col justify-start items-start gap-1">
          <p className="text-black font-medium">
            <span className="font-bold">4.</span> For testing purposes, click
            the test buttons above and check the popups appear correctly on your
            stream
          </p>
        </div>
      </div>
    </motion.div>
  );
};
