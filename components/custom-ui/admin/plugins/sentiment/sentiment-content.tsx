import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useTimer } from "@/hooks/use-timer";
import { AVAILABLE_DURATIONS } from "@/lib/constants";
import { Duration, Guest } from "@/lib/types/poll.type";
import { FormAmountInput } from "./form-amount-input";
import { FormDurationSelection } from "./form-duration-selection";
import { FormTextInput } from "./form-text-input";
import { GuestPayout } from "./guest-payout";
import { HistoryItem } from "./history-item";

const defaultDuration: Duration = AVAILABLE_DURATIONS[1];

export const SentimentContent = () => {
  const [prompt, setPrompt] = useState("");
  const [voteCost, setVoteCost] = useState("");
  const [duration, setDuration] = useState<Duration>(defaultDuration);
  const [isGuestPayoutActive, setIsGuestPayoutActive] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([
    {
      owner: true,
      nameOrAddress: "limone.base.eth",
      splitPercent: "100",
    },
  ]);
  const { timeString, addSeconds, startTimer, stopTimer } = useTimer({
    initialSeconds: duration.seconds,
    onEnd: async () => {
      setIsLive(false);
    },
  });

  // Handles the reset button
  const handleReset = () => {
    setPrompt("");
    setVoteCost("");
    setDuration(defaultDuration);
    setGuests([
      { owner: true, nameOrAddress: "limone.base.eth", splitPercent: "100" },
    ]);
    setIsGuestPayoutActive(false);
  };

  // Handles the extension of the live poll
  const handleExtendLivePoll = () => {
    const secondsToAdd = duration.seconds;
    addSeconds(secondsToAdd);
  };

  // Handles the start and stop of the live poll
  const startLive = () => {
    // If we are going live we need to check if the split amounts add up to 100
    const sumOfAllGuestsPercentages = guests.reduce(
      (acc, guest) => acc + parseFloat(guest.splitPercent),
      0,
    );
    // If it doesn't we need to move the remaining amount to the first guest
    if (sumOfAllGuestsPercentages < 100) {
      const remainingAmount =
        100 -
        guests
          .slice(1)
          .reduce((acc, guest) => acc + parseFloat(guest.splitPercent), 0);
      setGuests([
        {
          ...guests[0],
          splitPercent: remainingAmount.toString(),
        },
        ...guests.slice(1),
      ]);
    }
    setIsLive(true);
    startTimer();
  };

  // Handles the end of the live poll
  const endLive = () => {
    setIsLive(false);
    stopTimer();
  };

  // Whether the confirm button should be disabled
  const isConfirmButtonDisabled =
    !prompt ||
    !voteCost ||
    !duration ||
    (isGuestPayoutActive &&
      !guests.every(
        (guest) => guest.nameOrAddress && parseFloat(guest.splitPercent) > 0,
      ));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-[24px]">
        Create quick bull/bear polls where viewers pay to vote on a statement
        and see live sentiment results.
      </h1>
      {/* New poll form */}
      <NBCard className="gap-5 w-[64%] p-5">
        <motion.div
          key="live-banner"
          initial={{ opacity: 0, height: 0, marginBottom: "-20px" }}
          animate={{
            opacity: isLive ? 1 : 0,
            height: isLive ? "44px" : 0,
            marginBottom: isLive ? 0 : "-20px",
            transition: {
              height: {
                delay: isLive ? 0 : 0.25,
              },
              opacity: {
                delay: isLive ? 0.25 : 0,
              },
              marginBottom: {
                delay: isLive ? 0 : 0.25,
              },
            },
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex justify-center items-center w-full">
          <NBCard className="w-full bg-success rounded-full py-0.5">
            <p className="text-[24px] font-bold text-white">
              LIVE • {timeString} LEFT TO VOTE
            </p>
          </NBCard>
        </motion.div>
        <div className="flex justify-between items-center gap-5 w-full">
          <div className="flex flex-col justify-start items-start gap-5 w-full">
            <FormTextInput
              label="Prompt (up to 100 characters)"
              disabled={isLive}
              placeholder="Type prompt here..."
              sizeLimit={100}
              value={prompt}
              setValue={setPrompt}
            />
            <FormAmountInput
              label="Vote Cost"
              disabled={isLive}
              placeholder="e.g. $0.01"
              value={voteCost}
              setValue={setVoteCost}
            />
            <FormDurationSelection
              label={isLive ? "Extend duration" : "Duration"}
              selectedDuration={duration}
              setSelectedDuration={setDuration}
            />
          </div>
          <GuestPayout
            label="Guest payout"
            disabled={isLive}
            guests={guests}
            setGuests={setGuests}
            isActive={isGuestPayoutActive}
            setIsActive={setIsGuestPayoutActive}
          />
        </div>
        <div className="flex justify-between items-center w-full gap-2.5">
          <NBButton
            className="w-full"
            onClick={isLive ? handleExtendLivePoll : handleReset}>
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.p
                  key="live-left-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="text-[16px] font-extrabold text-success">
                  Extend
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  key="not-live-left-text"
                  className="text-[16px] font-extrabold text-destructive">
                  Reset
                </motion.p>
              )}
            </AnimatePresence>
          </NBButton>
          <NBButton
            className="w-full bg-accent"
            disabled={isConfirmButtonDisabled}
            onClick={isLive ? endLive : startLive}>
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  key="live-right-text"
                  className="text-[16px] font-extrabold text-white">
                  End voting
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  key="not-live-right-text"
                  className="text-[16px] font-extrabold text-white">
                  Confirm
                </motion.p>
              )}
            </AnimatePresence>
          </NBButton>
        </div>
      </NBCard>

      {/* Polls history */}
      <div className="flex flex-col justify-start items-start w-full gap-5">
        <p className="text-[20px] font-bold">History</p>
        <HistoryItem
          time="March 7th 4:09PM"
          question="ETH will flip BTC by the end of the year"
          bullPercent={66}
          bearPercent={34}
        />
        <HistoryItem
          time="August 15th 10:09AM"
          question="Pippo Baudo will die this year"
          bullPercent={43}
          bearPercent={57}
        />
      </div>
    </motion.div>
  );
};
