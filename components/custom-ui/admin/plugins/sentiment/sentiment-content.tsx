import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Address, isAddress } from "viem";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useBullmeterClaim } from "@/hooks/use-bullmeter-claim";
import { useBullmeterPlugin } from "@/hooks/use-bullmeter-plugin";
import { useSentimentPollSocket } from "@/hooks/use-sentiment-poll-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useTimer } from "@/hooks/use-timer";
import { AVAILABLE_DURATIONS, NATIVE_TOKEN_ADDRESS } from "@/lib/constants";
import {
  getAddressFromBaseName,
  getAddressFromEnsName,
} from "@/lib/ens/client";
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
import { HistoryItem } from "./history-item";

const defaultDuration: Duration = AVAILABLE_DURATIONS[1];

export const SentimentContent = () => {
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
    isLoading: isCreatingBullmeter,
  } = useBullmeterPlugin();
  const { claimAllBullmeters, isLoading: isClaiming } = useBullmeterClaim();
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
  const [currentLivePoll, setCurrentLivePoll] = useState<ReadPollData | null>(
    null,
  );
  const [claimablePolls, setClaimablePolls] = useState<{
    totalPolls: number;
    pollIds: string[];
  } | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const itemsPerPage = 3;
  const { timeString, addSeconds, startTimer, stopTimer } = useTimer({
    initialSeconds: duration.seconds,
    onEnd: async () => {
      setIsLive(false);
    },
  });

  // Handles the reset button
  const handleReset = async () => {
    // If there's a live poll, terminate and claim it first
    if (currentLivePoll) {
      try {
        const terminatePromise = terminateAndClaimBullmeter(
          currentLivePoll.pollId,
        ).then((res) => {
          if (!res.success) {
            throw new Error("Failed to terminate poll. Please try again.");
          }
          return res;
        });
        toast.promise(terminatePromise, {
          loading: "Terminating poll...",
          success: "Poll terminated and funds claimed!",
          error: (err) =>
            (err as Error)?.message ||
            "Failed to terminate poll. Please try again.",
          action: {
            label: "Close",
            onClick: () => {
              toast.dismiss();
            },
          },
          duration: 10,
        });
        const result = await terminatePromise;

        // Add socket event to end the poll (client to server)
        adminEndSentimentPoll({
          id: result.pollId || "1",
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
            nameOrAddress:
              admin.baseName || admin.ensName || admin.address || "",
            splitPercent: "100",
          },
        ]);
        setIsGuestPayoutActive(false);
        setIsLive(false);
        setCurrentLivePoll(null);
      } catch (error) {
        console.error("Failed to terminate poll:", error);
        // Don't reset UI state if blockchain transaction failed
      }
    } else {
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
    }
  };

  // Handles claiming all claimable polls
  const handleClaimAll = async () => {
    if (!admin.address) {
      toast.error("No admin address found");
      return;
    }

    // Clear previous errors
    setClaimError(null);
    try {
      const claimPromiseRaw = claimAllBullmeters(admin.address);
      const claimPromise = claimPromiseRaw.then((res) => {
        if (!res.success) {
          throw new Error("Failed to claim polls. Please try again.");
        }
        if ((res.result?.claimedPolls ?? 0) <= 0) {
          throw new Error("No claimable polls found");
        }
        return res;
      });
      toast.promise(claimPromise, {
        loading: "Checking for claimable polls...",
        success: (res) =>
          `Successfully claimed funds from ${res.result.claimedPolls} polls!`,
        error: (err) =>
          (err as Error)?.message || "Failed to claim polls. Please try again.",
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
        duration: 10,
      });
      const result = await claimPromise;

      // Refetch history to get updated poll data
      const historyResponse = await getAllPollsByCreator();
      if (historyResponse.success && historyResponse.result) {
        setPollHistory(historyResponse.result);
        checkForLivePoll(historyResponse.result);
      }

      // Clear claimable polls state
      setClaimablePolls(null);
    } catch (error) {
      console.error("Failed to claim polls:", error);
      const errorMessage =
        (error as Error)?.message || "Failed to claim polls. Please try again.";
      setClaimError(errorMessage);
    }
  };

  // Handles the extension of the live poll
  const handleExtendLivePoll = async () => {
    if (!currentLivePoll) {
      console.error("No live poll to extend");
      return;
    }
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
      toast.promise(extendPromise, {
        loading: "Extending poll...",
        success: "Poll extended successfully!",
        error: (err) =>
          (err as Error)?.message || "Failed to extend poll. Please try again.",
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
        duration: 10,
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
        position: PopupPositions.TOP_CENTER,
        endTimeMs: (result.deadline || 0) * 1000,
        voters: 0,
        votes: result.votesCount ?? 0,
        results: {
          bullPercent: result.totalYesVotes ?? 0,
          bearPercent: result.totalNoVotes ?? 0,
        },
      });
    } catch (error) {
      console.error("Failed to extend poll:", error);
      // error toast handled by toast.promise
    }
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

      // Get the first guest (owner) for the guest address and split percent
      const ownerGuest = guests.find((guest) => !guest.owner);

      let guestAddress = NATIVE_TOKEN_ADDRESS;
      let splitPercent = 0;

      if (ownerGuest) {
        guestAddress = isAddress(ownerGuest.nameOrAddress!)
          ? ownerGuest.nameOrAddress
          : (await getAddressFromBaseName(
              ownerGuest.nameOrAddress as Address,
            )) ||
            (await getAddressFromEnsName(
              ownerGuest.nameOrAddress as Address,
            )) ||
            "";
        splitPercent = guestAddress ? Number(ownerGuest.splitPercent) * 100 : 0;
      }

      const createPromise = createBullmeter(
        prompt, // question
        "10000", // votePrice (0.01 USDC)
        0, // startTime (current timestamp)
        duration.seconds, // duration in seconds
        10000, // maxVotePerUser
        guestAddress!, // guest address from UI
        splitPercent, // guestSplitPercent from UI
      ).then((res) => {
        if (!res.success) {
          throw new Error("Failed to create Bullmeter poll. Please try again.");
        }
        return res;
      });
      toast.promise(createPromise, {
        loading: "Creating Bullmeter poll...",
        success: "Bullmeter poll created successfully!",
        error: (err) =>
          (err as Error)?.message ||
          "Failed to create Bullmeter poll. Please try again.",
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
        duration: 10,
      });
      const result = await createPromise;

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
          position: PopupPositions.TOP_CENTER,
          pollQuestion: prompt,
          endTimeMs: (result.deadline || 0) * 1000,
          guests,
          results: { bullPercent: 0, bearPercent: 0 },
        });
        return true as const;
      });
      toast.promise(startPromise, {
        loading: "Starting poll...",
        // Avoid duplicate success feedback; socket onStart already notifies
        success: () => null,
        error: "Failed to start poll",
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
        duration: 5,
      });
      await startPromise;
    } catch (error) {
      console.error("Failed to create Bullmeter poll:", error);
      // error toast handled by toast.promise
    }
  };

  // Load poll history on component mount and check for live polls
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getAllPollsByCreator();

        if (response.success && response.result) {
          setPollHistory(response.result);
          setCurrentPage(1); // Reset to first page when new data is loaded

          // Check for live polls
          checkForLivePoll(response.result);
        } else {
          console.error(`❌ Failed to fetch history: ${response.error}`);
        }
      } catch (error) {
        console.error("❌ History fetch error:", error);
      }
    };

    loadHistory();
  }, [admin.address]);

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

  // Pagination logic - reverse order to show most recent first
  const reversedPollHistory = [...pollHistory].reverse();
  const totalPages = Math.ceil(reversedPollHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = reversedPollHistory.slice(startIndex, endIndex);

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

  useSentimentPollSocket({
    joinInfo: {
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
              onClick={isLive ? handleReset : startLive}>
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
          <div className="flex items-center gap-3">
            {claimablePolls && claimablePolls.totalPolls > 0 && (
              <NBCard className="bg-warning/20 border-warning/30 px-3 py-1">
                <p className="text-sm font-medium text-warning">
                  {claimablePolls.totalPolls} claimable poll
                  {claimablePolls.totalPolls !== 1 ? "s" : ""}
                </p>
              </NBCard>
            )}
            {claimError && (
              <NBCard className="bg-destructive/20 border-destructive/30 px-3 py-1">
                <p className="text-sm font-medium text-destructive">
                  {claimError}
                </p>
              </NBCard>
            )}
            <NBButton
              className="bg-warning hover:bg-warning/90 shrink-0"
              disabled={isClaiming}
              onClick={handleClaimAll}>
              <p className="font-extrabold text-white">
                {isClaiming ? "Claiming..." : "Claim All"}
              </p>
            </NBButton>
          </div>
        </div>

        {reversedPollHistory.length > 0 ? (
          <>
            <div className="flex flex-col gap-3 w-full">
              {currentPageData.map((poll) => {
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
