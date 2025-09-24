import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useBullmeterClaim } from "@/hooks/use-bullmeter-claim";
import { useBullmeterPlugin } from "@/hooks/use-bullmeter-plugin";
import { ReadPollData } from "@/lib/types/bullmeter.type";
import { HistoryItem } from "./history-item";

const ITEMS_PER_PAGE = 3;

interface PollsHistoryProps {
  pollHistory: ReadPollData[];
  setPollHistory: Dispatch<SetStateAction<ReadPollData[]>>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  previousPage: number;
  setPreviousPage: (page: number) => void;
  checkForLivePoll: (polls: ReadPollData[]) => void;
}

export const PollsHistory = ({
  pollHistory,
  setPollHistory,
  currentPage,
  setCurrentPage,
  previousPage,
  setPreviousPage,
  checkForLivePoll,
}: PollsHistoryProps) => {
  // States
  const [claimablePolls, setClaimablePolls] = useState<{
    totalPolls: number;
    pollIds: string[];
  } | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isLoadingPolls, setIsLoadingPolls] = useState(false);
  const { getAllPollsByCreator } = useBullmeterPlugin();

  // Hooks
  const { claimAllBullmeters, isLoading: isClaiming } = useBullmeterClaim();
  const { admin } = useAdminAuth();

  useEffect(() => {
    console.log("TEST currentPage", currentPage);
    console.log("TEST previousPage", previousPage);
  }, [currentPage, previousPage]);

  // Handles claiming all claimable polls
  const handleClaimAll = async () => {
    if (!admin.address) {
      toast.error("No admin address found");
      return;
    }

    // Clear previous errors
    setClaimError(null);
    setIsLoadingPolls(true);
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
      await claimPromise;

      // Refetch history to get updated poll data
      const historyResponse = await getAllPollsByCreator();
      if (historyResponse.success && historyResponse.result) {
        setPollHistory(historyResponse.result);
        checkForLivePoll(historyResponse.result);
      }

      // Clear claimable polls state
      setClaimablePolls(null);
      toast.success("Polls claimed successfully");
    } catch (error) {
      console.log("Failed to claim polls:", error);
      const errorMessage =
        (error as Error)?.message || "Failed to claim polls. Please try again.";
      setClaimError(errorMessage);
      toast.error("Failed to claim polls");
    } finally {
      setIsLoadingPolls(false);
    }
  };

  // Pagination logic - reverse order to show most recent first
  const reversedPollHistory = [...pollHistory].reverse();
  const totalPages = Math.ceil(reversedPollHistory.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = reversedPollHistory.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPreviousPage(currentPage);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPreviousPage(currentPage);
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

  // Load poll history on component mount and check for live polls
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingPolls(true);
      try {
        const response = await getAllPollsByCreator();

        if (response.success && response.result) {
          setPollHistory(response.result);
          setCurrentPage(1); // Reset to first page when new data is loaded

          // Check for live polls
          checkForLivePoll(response.result);
        } else {
          console.log(`❌ Failed to fetch history: ${response.error}`);
        }
      } catch (error) {
        console.log("❌ History fetch error:", error);
      } finally {
        setIsLoadingPolls(false);
      }
    };

    loadHistory();
  }, [admin.address]);

  return (
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

      <AnimatePresence mode="wait">
        {isLoadingPolls ? (
          <motion.div
            key="loading-polls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex justify-center items-center w-full h-[250px]">
            <Loader2 className="size-10 text-gray-500 animate-spin" />
          </motion.div>
        ) : reversedPollHistory.length > 0 ? (
          <motion.div
            key="polls-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex flex-col justify-center items-center w-full gap-3">
            <div className="flex flex-col justify-center items-center w-full gap-3 overflow-hidden">
              <AnimatePresence
                mode="wait"
                custom={{ currentPage, previousPage }}>
                {currentPageData.map((poll, index) => {
                  const formattedPoll = formatPollForDisplay(poll);
                  return (
                    <HistoryItem
                      key={`${poll.pollId}-${index}`}
                      index={index}
                      deadline={formattedPoll.deadline}
                      question={formattedPoll.question}
                      bullPercent={formattedPoll.bullPercent}
                      bearPercent={formattedPoll.bearPercent}
                      totalVotes={formattedPoll.totalVotes}
                      usdcCollected={formattedPoll.usdcCollected}
                      currentPage={currentPage}
                      previousPage={previousPage}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <NBButton
                  className="px-4 py-2 text-sm font-semibold"
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}>
                  Previous
                </NBButton>

                <p className="text-sm font-semibold">
                  {currentPage} of {totalPages}
                </p>

                <NBButton
                  className="px-4 py-2 text-sm font-semibold"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}>
                  Next
                </NBButton>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="no-polls-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="text-gray-500">
            No poll history available. Create your first poll!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
