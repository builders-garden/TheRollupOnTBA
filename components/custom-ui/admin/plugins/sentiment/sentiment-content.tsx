import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useBullmeterPlugin } from "@/hooks/use-bullmeter-plugin";
import { useSentimentPollSocket } from "@/hooks/use-sentiment-poll-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useTimer } from "@/hooks/use-timer";
import { AVAILABLE_DURATIONS } from "@/lib/constants";
import { PopupPositions } from "@/lib/enums";
import { ReadPollData } from "@/lib/types/bullmeter.type";
import { Duration, Guest } from "@/lib/types/poll.type";
import {
  EndPollNotificationEvent,
  PollNotificationEvent,
  UpdatePollNotificationEvent,
} from "@/lib/types/socket/server-to-client.type";
import { FormDurationSelection } from "./form-duration-selection";
import { FormTextInput } from "./form-text-input";
import { GuestPayout } from "./guest-payout";
import { PollsHistory } from "./polls-history";

const defaultDuration: Duration = AVAILABLE_DURATIONS[1];

export const SentimentContent = ({ brandId }: { brandId: string }) => {
  const {
    adminStartBullmeter: adminStartSentimentPoll,
    adminEndBullmeter: adminEndSentimentPoll,
    adminUpdateSentimentPoll,
  } = useSocketUtils();
  const {
    createBullmeter,
    extendBullmeter,
    terminateAndClaimBullmeter,
    getAllPollsByCreator,
  } = useBullmeterPlugin();
  const { admin } = useAdminAuth();

  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isExtendingPoll, setIsExtendingPoll] = useState(false);
  const [isTerminatingPoll, setIsTerminatingPoll] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<Duration>(defaultDuration);
  const [isGuestPayoutActive, setIsGuestPayoutActive] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([
    {
      owner: true,
      nameOrAddress: admin.baseName || admin.ensName || admin.address || "",
      splitPercent: "100",
    },
  ]);
  const [pollHistory, setPollHistory] = useState<ReadPollData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(0);
  const [currentLivePoll, setCurrentLivePoll] = useState<ReadPollData | null>(
    null,
  );
  const { timeString, addSeconds, startTimer, stopTimer } = useTimer({
    initialSeconds: duration.seconds,
    onEnd: async () => {
      setIsLive(false);
    },
  });

  const handleTerminateAndClaim = async () => {
    if (!currentLivePoll) return;
    setIsTerminatingPoll(true);
    try {
      const terminatePromise = terminateAndClaimBullmeter(
        currentLivePoll.pollId,
      ).then((res) => {
        if (!res.success) {
          throw new Error("Failed to terminate poll. Please try again.");
        }
        return res;
      });
      const result = await terminatePromise;

      // Add socket event to end the poll (client to server)
      adminEndSentimentPoll({
        id: result.pollId || "1",
        brandId,
        voters: result.votes?.yes ?? 0,
        votes: result.votes?.total ?? 0,
        results: {
          bullPercent: result.votes?.yes ?? 0,
          bearPercent: result.votes?.no ?? 0,
        },
      });

      // Refetch history to get updated poll data
      const historyResponse = await getAllPollsByCreator();
      if (historyResponse.success && historyResponse.result) {
        setPollHistory(historyResponse.result);
        checkForLivePoll(historyResponse.result);
      }

      // Only reset UI state if blockchain transaction was successful
      setPrompt("");
      setDuration(defaultDuration);
      setGuests([
        {
          owner: true,
          nameOrAddress: admin.baseName || admin.ensName || admin.address || "",
          splitPercent: "100",
        },
      ]);
      setIsGuestPayoutActive(false);
      setIsLive(false);
      setCurrentLivePoll(null);
      toast.success("Poll terminated and funds claimed");
    } catch (error) {
      console.log("Failed to terminate poll:", error);
      toast.error("Failed to terminate poll");
    } finally {
      setIsTerminatingPoll(false);
    }
  };

  // Handles the reset button
  const handleReset = async () => {
    if (currentLivePoll) return;
    // If no live poll, just reset the UI state
    setPrompt("");
    setDuration(defaultDuration);
    setGuests([
      {
        owner: true,
        nameOrAddress: admin.baseName || admin.ensName || admin.address || "",
        splitPercent: "100",
      },
    ]);
    setIsGuestPayoutActive(false);
    setIsLive(false);
    setCurrentLivePoll(null);
  };

  // Handles the extension of the live poll
  const handleExtendLivePoll = async () => {
    if (!currentLivePoll) {
      console.log("No live poll to extend");
      toast.error("No live poll to extend");
      return;
    }
    setIsExtendingPoll(true);
    try {
      const newDuration = duration.seconds; // Use the duration selected from the UI
      console.log("newDuration:", newDuration);
      const extendPromise = extendBullmeter(
        currentLivePoll.pollId,
        newDuration,
      ).then((res) => {
        if (!res.success) {
          throw new Error("Failed to extend poll. Please try again.");
        }
        return res;
      });
      const result = await extendPromise;

      // Add the extension time to the current timer
      addSeconds(newDuration);

      // Refetch history to get updated poll data
      const historyResponse = await getAllPollsByCreator();

      if (historyResponse.success && historyResponse.result) {
        setPollHistory(historyResponse.result);
        checkForLivePoll(historyResponse.result);
      } else {
        console.log("❌ History refetch failed:", historyResponse);
      }

      // Add socket event to extend the poll (client to server)
      adminUpdateSentimentPoll({
        id: result.pollId || "1",
        brandId,
        position: PopupPositions.TOP_CENTER,
        endTimeMs: (result.deadline || 0) * 1000,
        voters: 0,
        votes: result.votesCount ?? 0,
        results: {
          bullPercent: result.totalYesVotes ?? 0,
          bearPercent: result.totalNoVotes ?? 0,
        },
      });
      toast.success("Poll extended successfully");
    } catch (error) {
      console.log("Failed to extend poll:", error);
      toast.error("Failed to extend poll");
    } finally {
      setIsExtendingPoll(false);
    }
  };

  // Handles the start and stop of the live poll
  const startLive = async () => {
    setIsCreatingPoll(true);
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

    try {
      const result = await createBullmeter(
        brandId,
        prompt, // question
        "10000", // votePrice (0.01 USDC)
        0, // startTime (current timestamp)
        duration.seconds, // duration in seconds
        10000, // maxVotePerUser
        guests, // The guests array
      ).then((res) => {
        if (!res.success) {
          throw new Error("Failed to create Bullmeter poll. Please try again.");
        }
        return res;
      });

      // Refetch history to get the new poll and check for live status
      const historyResponse = await getAllPollsByCreator();
      if (historyResponse.success && historyResponse.result) {
        setPollHistory(historyResponse.result);
        setCurrentPage(1); // Reset to first page

        // Check for live polls with the updated data
        checkForLivePoll(historyResponse.result) || 0;
      }

      // Now proceed with the existing UI poll logic
      const startPromise = Promise.resolve().then(() => {
        // Add socket event to start the poll (client to server)
        adminStartSentimentPoll({
          id: result.pollId || "1",
          brandId,
          position: PopupPositions.TOP_CENTER,
          pollQuestion: prompt,
          endTimeMs:
            result.deadline && result.deadline !== 0
              ? result.deadline * 1000
              : 180000, // 180 seconds
          guests,
          results: { bullPercent: 0, bearPercent: 0 },
        });
        return true as const;
      });
      await startPromise;
      toast.success("Poll created successfully");
    } catch (error) {
      console.log("Failed to create Bullmeter poll:", error);
      toast.error("Failed to create poll");
    } finally {
      setIsCreatingPoll(false);
    }
  };

  // Periodic check for live poll status (every 30 seconds)
  useEffect(() => {
    if (!currentLivePoll) return;

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = Number(currentLivePoll.deadline);

      if (currentTime >= deadline) {
        // Poll has ended
        setIsLive(false);
        setCurrentLivePoll(null);
      } else {
        console.log("✅ POLL STILL LIVE");
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [currentLivePoll]);

  // Function to check if there's a live poll based on the most recent poll
  const checkForLivePoll = (polls: ReadPollData[]) => {
    if (polls.length === 0) {
      console.log("No polls found in history");
      return null;
    }

    // Get the most recent poll (assuming they're ordered by creation time)
    const mostRecentPoll = polls[polls.length - 1];

    // Check if the deadline has passed
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const deadline = Number(mostRecentPoll.deadline);

    if (currentTime < deadline) {
      // Poll is still live
      setIsLive(true);
      setCurrentLivePoll(mostRecentPoll);

      // Calculate remaining time
      const remainingSeconds = deadline - currentTime;

      console.log("✅ POLL IS LIVE!");

      // Update the prompt to show the live poll question
      setPrompt(mostRecentPoll.question);

      // Start the timer with the remaining time
      startTimer(remainingSeconds);
      // Return the deadline of the live poll
      return deadline;
    } else {
      setIsLive(false);
      setCurrentLivePoll(null);
      console.log("❌ POLL IS NOT LIVE - Deadline has passed");
      return null;
    }
  };

  // Whether the confirm button should be disabled
  const isConfirmButtonDisabled =
    !prompt ||
    !duration ||
    (isGuestPayoutActive &&
      !guests.every(
        (guest) => guest.nameOrAddress && parseFloat(guest.splitPercent) > 0,
      ));

  useSentimentPollSocket({
    joinInfo: {
      brandId,
      username: "Admin",
      profilePicture: "https://via.placeholder.com/150",
    },
    onStart: (data: PollNotificationEvent) => {
      setIsLive(true);
      toast.success("Poll started");
      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = Math.floor(data.endTimeMs / 1000);
      const remainingSeconds = Math.max(0, deadline - currentTime);
      startTimer(remainingSeconds);
    },
    onUpdate: (data: UpdatePollNotificationEvent) => {
      console.log("✅ POLL UPDATED", data);
    },
    onEnd: (_: EndPollNotificationEvent) => {
      setIsLive(false);
      toast.success("Poll ended");
      stopTimer();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-2xl">
        Create quick bull/bear polls where viewers pay to vote on a statement
        and see live sentiment results.
      </h1>
      {/* New poll form */}
      <NBCard className="gap-5 w-[64%] p-5">
        <div className="flex flex-col gap-3 justify-center items-center w-full h-full p-2.5">
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
              <p className="text-2xl font-bold text-white">
                LIVE • {timeString} LEFT TO VOTE
              </p>
            </NBCard>
          </motion.div>
          <div className="flex justify-between items-center gap-5 w-full">
            <div className="flex flex-col justify-start items-start gap-5 w-full">
              <FormTextInput
                label="Prompt (up to 75 characters)"
                disabled={isLive}
                placeholder="Type prompt here..."
                sizeLimit={75}
                value={prompt}
                setValue={setPrompt}
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
              className="w-full h-[42px]"
              disabled={isExtendingPoll || isTerminatingPoll || isCreatingPoll}
              onClick={isLive ? handleExtendLivePoll : handleReset}>
              <AnimatePresence mode="wait">
                {isExtendingPoll ? (
                  <motion.div
                    key="extending-bullmeter-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}>
                    <Loader2 className="size-5 text-black animate-spin" />
                  </motion.div>
                ) : isLive ? (
                  <motion.p
                    key="live-left-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="text-base font-extrabold text-success">
                    Extend
                  </motion.p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    key="not-live-left-text"
                    className="text-base font-extrabold text-destructive">
                    Reset
                  </motion.p>
                )}
              </AnimatePresence>
            </NBButton>
            <NBButton
              className="w-full bg-accent h-[42px]"
              disabled={
                isConfirmButtonDisabled || isTerminatingPoll || isCreatingPoll
              }
              onClick={isLive ? handleTerminateAndClaim : startLive}>
              <AnimatePresence mode="wait">
                {isCreatingPoll || isTerminatingPoll ? (
                  <motion.div
                    key="creating-terminating-bullmeter-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}>
                    <Loader2 className="size-5 text-white animate-spin" />
                  </motion.div>
                ) : isLive ? (
                  <motion.p
                    key="live-right-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="text-base font-extrabold text-white">
                    End voting
                  </motion.p>
                ) : (
                  <motion.p
                    key="not-live-right-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="text-base font-extrabold text-white">
                    Confirm
                  </motion.p>
                )}
              </AnimatePresence>
            </NBButton>
          </div>
        </div>
      </NBCard>

      {/* Polls history */}
      <PollsHistory
        pollHistory={pollHistory}
        setPollHistory={setPollHistory}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        previousPage={previousPage}
        setPreviousPage={setPreviousPage}
        checkForLivePoll={checkForLivePoll}
      />
    </motion.div>
  );
};
