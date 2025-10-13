import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NBButton } from "@/components/custom-ui/nb-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { usePollsAnalytics } from "@/hooks/use-brand-analytics";
import { usePollsAnalyticsMetrics } from "@/hooks/use-brand-analytics-metrics";
import { AuthTokenType } from "@/lib/enums";
import { cn } from "@/lib/utils";

type SortField = "totalVotes" | "totalAmount" | "firstVote" | "lastVote";

interface SortableTableHeaderProps {
  field: SortField;
  label: string;
  currentSortField: SortField;
  currentSortDir: "asc" | "desc";
  onSort: (field: SortField) => void;
}

const SortableTableHeader = ({
  field,
  label,
  currentSortField,
  currentSortDir,
  onSort,
}: SortableTableHeaderProps) => {
  const isCurrentSort = field === currentSortField;

  return (
    <TableHead className="w-[18.75%]">
      <button
        onClick={() => onSort(field)}
        className={cn(
          "flex items-center gap-1 hover:text-accent-foreground cursor-pointer w-full",
          isCurrentSort && "text-accent-foreground",
        )}>
        {label}
        <AnimatePresence mode="wait">
          {isCurrentSort ? (
            <motion.div
              key="current-sort"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}>
              <ChevronUp
                className={cn(
                  "size-4 text-accent transition-all duration-200",
                  currentSortDir === "desc" && "rotate-180",
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key="not-sorted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}>
              <ChevronsUpDown className="size-4 text-accent" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </TableHead>
  );
};

const StatsCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card text-card-foreground shadow">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

// Max items per page for votes analytics
const MAX_ITEMS_PER_PAGE = 10;

export const PollsContent = () => {
  const { brand } = useAdminAuth();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("totalAmount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = usePollsAnalytics({
    page,
    limit: MAX_ITEMS_PER_PAGE,
    sortBy,
    sortDir,
    tokenType: AuthTokenType.ADMIN_AUTH_TOKEN,
    enabled: !!brand?.data?.id,
    brandId: brand?.data?.id,
  });

  const { data: metricsData, isLoading: isLoadingMetrics } =
    usePollsAnalyticsMetrics({
      tokenType: AuthTokenType.ADMIN_AUTH_TOKEN,
      brandId: brand?.data?.id,
      enabled: !!brand?.data?.id,
    });

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      // Toggle direction if clicking the same field
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      setSortBy(field);
      setSortDir("desc");
    }
    // Reset to first page when sorting changes
    setPage(1);
  };

  // The loading is considered initial if both metrics and table data are loading
  const isInitialLoad = isLoading && isLoadingMetrics;

  return (
    <AnimatePresence mode="wait">
      {isInitialLoad ? (
        <motion.div
          key="loading-votes-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex justify-center items-center w-full h-[256px]">
          <Loader2 className="size-10 text-black animate-spin" />
        </motion.div>
      ) : error ? (
        <motion.div
          key="error-votes-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex justify-center items-center w-full h-[256px]">
          <p className="text-lg font-bold text-destructive text-center">
            Error loading analytics data.
            <br />
            Please try again later!
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="votes-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex flex-col justify-start items-center w-full p-5 gap-5">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full relative">
            <AnimatePresence mode="wait">
              {isLoadingMetrics && (
                <motion.div
                  key="loading-metrics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 animate-pulse transition-all duration-300"
                />
              )}
            </AnimatePresence>
            <StatsCard
              title="Total Votes"
              value={metricsData?.data.totalVotes || 0}
            />
            <StatsCard
              title="Unique Voters"
              value={metricsData?.data.uniqueVoters || 0}
            />
            <StatsCard
              title="Total Amount (USDC)"
              value={(metricsData?.data.totalAmount || 0).toFixed(2)}
            />
          </div>

          {/* Analytics Table */}
          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {isLoading && !isInitialLoad && (
                <motion.div
                  key="loading-table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 animate-pulse transition-all duration-300"
                />
              )}
            </AnimatePresence>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">User</TableHead>
                  <SortableTableHeader
                    field="totalVotes"
                    label="Total Votes"
                    currentSortField={sortBy}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableTableHeader
                    field="totalAmount"
                    label="Total Amount"
                    currentSortField={sortBy}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableTableHeader
                    field="firstVote"
                    label="First Vote"
                    currentSortField={sortBy}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableTableHeader
                    field="lastVote"
                    label="Last Vote"
                    currentSortField={sortBy}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="flex items-center gap-2">
                      {user.farcasterAvatarUrl && (
                        <img
                          src={user.farcasterAvatarUrl}
                          alt=""
                          className="size-8 rounded-full"
                        />
                      )}
                      <a
                        href={`https://farcaster.xyz/${user.farcasterUsername || user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-accent hover:underline">
                        {user.farcasterDisplayName ||
                          user.farcasterUsername ||
                          user.username}
                      </a>
                    </TableCell>
                    <TableCell>{user.totalVotes}</TableCell>
                    <TableCell>{user.totalAmount} USDC</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.firstVote), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.lastVote), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {data?.pagination?.totalPages && data.pagination.totalPages > 0 ? (
            <div className="flex justify-center items-center gap-4 pt-4">
              <NBButton
                variant="outline"
                className="p-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}>
                <ChevronLeft className="size-4" />
              </NBButton>

              <span className="text-sm">
                Page {data?.pagination.page} of {data?.pagination.totalPages}
              </span>

              <NBButton
                variant="outline"
                className="p-2"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data?.pagination.hasMore}>
                <ChevronRight className="size-4" />
              </NBButton>
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
