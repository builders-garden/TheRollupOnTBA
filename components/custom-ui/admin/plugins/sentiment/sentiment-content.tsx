import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useBullmeterPlugin } from "@/hooks/use-bullmeter-plugin";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useTimer } from "@/hooks/use-timer";
import { AVAILABLE_DURATIONS } from "@/lib/constants";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import { ReadPollData } from "@/lib/types/bullmeter.type";
import { Duration, Guest } from "@/lib/types/poll.type";
import {
  EndPollNotificationEvent,
  PollNotificationEvent,
} from "@/lib/types/socket/server-to-client.type";
import { FormDurationSelection } from "./form-duration-selection";
import { FormTextInput } from "./form-text-input";
import { GuestPayout } from "./guest-payout";
import { HistoryItem } from "./history-item";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { Address, isAddress } from 'viem'
import { getAddressFromBaseName, getAddressFromEnsName, getBasenameName, getEnsName } from "@/lib/ens/client";



const defaultDuration: Duration = AVAILABLE_DURATIONS[1];

export const SentimentContent = () => {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream, adminStartSentimentPoll, adminEndSentimentPoll } =
    useSocketUtils();
  const {
    createBullmeter,
    getAllPollsByCreator,
    isLoading: isCreatingBullmeter,
    error: bullmeterError,
  } = useBullmeterPlugin();
  const { admin } = useAdminAuth();


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
  const itemsPerPage = 3;
  const { timeString, addSeconds, startTimer, stopTimer } = useTimer({
    initialSeconds: duration.seconds,
    onEnd: async () => {
      setIsLive(false);
    },
  });

  // Handles the reset button
  const handleReset = () => {
    setPrompt("");
    setDuration(defaultDuration);
    setGuests([
      { owner: true, nameOrAddress: admin.baseName || admin.ensName || admin.address || "", splitPercent: "100" },
    ]);
    setIsGuestPayoutActive(false);
    adminEndSentimentPoll({
      id: "1",
    });
  };

  // Handles the extension of the live poll
  const handleExtendLivePoll = () => {
    const secondsToAdd = duration.seconds;
    addSeconds(secondsToAdd);
  };

  // Handles the start and stop of the live poll
  const startLive = async () => {
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
      // First create the Bullmeter poll on-chain
      toast.loading("Creating Bullmeter poll...", {
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
        duration: 10,
      });

      // Get the first guest (owner) for the guest address and split percent
      const ownerGuest = guests.find((guest) => !guest.owner);
    
      const guestAddress = isAddress(ownerGuest?.nameOrAddress!)
        ? ownerGuest?.nameOrAddress
        : (
            (await getAddressFromBaseName(ownerGuest?.nameOrAddress as Address)) ||
            (await getAddressFromEnsName(ownerGuest?.nameOrAddress as Address)) ||
            ""
          );
      const splitPercent = guestAddress ? Number(ownerGuest?.splitPercent) * 100 : 0;
      const result = await createBullmeter(
        prompt, // question
        "10000", // votePrice (0.01 USDC)
        0, // startTime (current timestamp)
        duration.seconds, // duration in seconds
        10000, // maxVotePerUser
        guestAddress!, // guest address from UI
        splitPercent, // guestSplitPercent from UI
      );

      if (result.success) {
        toast.success("Bullmeter poll created successfully!");

        // Now proceed with the existing UI poll logic
        toast.loading("Starting poll...", {
          action: {
            label: "Close",
            onClick: () => {
              toast.dismiss();
            },
          },
          duration: 5,
        });
        adminStartSentimentPoll({
          username: "Admin",
          position: PopupPositions.TOP_LEFT,
          profilePicture: "https://via.placeholder.com/150",
          pollQuestion: prompt,
          endTime: new Date(Date.now() + duration.seconds * 1000),
          guests,
          results: { bullPercent: 0, bearPercent: 0 },
        });
      }
    } catch (error) {
      console.error("Failed to create Bullmeter poll:", error);
      toast.error("Failed to create Bullmeter poll. Please try again.");
    }
  };

  // Handles the end of the live poll
  const endLive = () => {
    adminEndSentimentPoll({
      id: "1",
    });
  };

  // Load poll history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getAllPollsByCreator();

        if (response.success && response.result) {
          setPollHistory(response.result);
          setCurrentPage(1); // Reset to first page when new data is loaded
        } else {
          console.error(`Failed to fetch history: ${response.error}`);
        }
      } catch (error) {
        console.error("History fetch error:", error);
      }
    };

    loadHistory();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(pollHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = pollHistory.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Helper function to format poll data for display
  const formatPollForDisplay = (poll: ReadPollData) => {
    const totalVotes = Number(poll.totalYesVotes) + Number(poll.totalNoVotes);
    // Always show 50/50 split when no votes to display animations
    const bullPercent =
      totalVotes > 0
        ? Math.round((Number(poll.totalYesVotes) / totalVotes) * 100)
        : 50;
    const bearPercent =
      totalVotes > 0
        ? Math.round((Number(poll.totalNoVotes) / totalVotes) * 100)
        : 50;

    // Convert startTime to UTC date string
    const startDate = new Date(Number(poll.startTime) * 1000);
    const startUtcString = startDate.toUTCString();

    // Convert deadline to UTC date string
    const deadlineDate = new Date(Number(poll.deadline) * 1000);
    const deadlineUtcString = deadlineDate.toUTCString();

    // Format USDC collected (convert from wei to USDC)
    const usdcCollected = Number(poll.totalUsdcCollected) / 1e6; // Assuming 6 decimals for USDC

    return {
      time: startUtcString,
      deadline: deadlineUtcString,
      question: poll.question,
      bullPercent,
      bearPercent,
      totalVotes,
      usdcCollected,
      state: poll.state,
      result: poll.result,
    };
  };

  // Whether the confirm button should be disabled
  const isConfirmButtonDisabled =
    !prompt ||
    !duration ||
    (isGuestPayoutActive &&
      !guests.every(
        (guest) => guest.nameOrAddress && parseFloat(guest.splitPercent) > 0,
      ));

  useEffect(() => {
    // Join the stream
    joinStream({
      username: "Admin",
      profilePicture: "https://via.placeholder.com/150",
    });

    // Create event handlers
    const handleStartSentimentPoll = (data: PollNotificationEvent) => {
      setIsLive(true);
      toast.success("Poll started");
      startTimer();
    };

    const handleEndSentimentPoll = (data: EndPollNotificationEvent) => {
      setIsLive(false);
      toast.success("Poll ended");
      stopTimer();
    };

    subscribe(
      ServerToClientSocketEvents.START_SENTIMENT_POLL,
      handleStartSentimentPoll,
    );
    subscribe(
      ServerToClientSocketEvents.END_SENTIMENT_POLL,
      handleEndSentimentPoll,
    );

    return () => {
      unsubscribe(
        ServerToClientSocketEvents.START_SENTIMENT_POLL,
        handleStartSentimentPoll,
      );
      unsubscribe(
        ServerToClientSocketEvents.END_SENTIMENT_POLL,
        handleEndSentimentPoll,
      );
    };
  }, [subscribe]);

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
        <motion.div
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex flex-col gap-3 justify-center items-center w-full h-full p-2.5"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [0.9, 1.03, 1],
            transition: {
              duration: 0.6,
              ease: [0.19, 1.0, 0.22, 1.0],
              opacity: { duration: 0.3 },
              scale: { times: [0, 0.6, 1], duration: 0.6 },
            },
          }}>
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
                label="Prompt (up to 100 characters)"
                disabled={isLive}
                placeholder="Type prompt here..."
                sizeLimit={100}
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
              className="w-full bg-accent"
              disabled={isConfirmButtonDisabled || isCreatingBullmeter}
              onClick={isLive ? endLive : startLive}>
              <AnimatePresence mode="wait">
                {isLive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    key="live-right-text"
                    className="text-base font-extrabold text-white">
                    End voting
                  </motion.p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    key="not-live-right-text"
                    className="text-base font-extrabold text-white">
                    {isCreatingBullmeter ? "Creating..." : "Confirm"}
                  </motion.p>
                )}
              </AnimatePresence>
            </NBButton>
          </div>
        </motion.div>
      </NBCard>

      {/* Polls history */}
      <div className="flex flex-col justify-start items-start w-full gap-5">
        <div className="flex justify-between items-center w-full">
          <p className="text-xl font-bold">History</p>
          {pollHistory.length > 0 && (
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, pollHistory.length)}{" "}
              of {pollHistory.length} polls
            </p>
          )}
        </div>

        {pollHistory.length > 0 ? (
          <>
            <div className="flex flex-col gap-3 w-full">
              {currentPageData.map((poll, index) => {
                const formattedPoll = formatPollForDisplay(poll);
                return (
                  <HistoryItem
                    key={poll.pollId}
                    deadline={formattedPoll.deadline}
                    question={formattedPoll.question}
                    bullPercent={formattedPoll.bullPercent}
                    bearPercent={formattedPoll.bearPercent}
                    totalVotes={formattedPoll.totalVotes}
                    usdcCollected={formattedPoll.usdcCollected}
                  />
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <NBButton
                  className="px-4 py-2 text-sm"
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}>
                  Previous
                </NBButton>

                <NBButton
                  className="px-4 py-2 text-sm"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}>
                  Next
                </NBButton>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">
            No poll history available. Create your first poll!
          </p>
        )}
      </div>
    </motion.div>
  );
};
