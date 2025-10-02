import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
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
import { useBrandAnalytics } from "@/hooks/use-brand-analytics";
import { useBrandAnalyticsMetrics } from "@/hooks/use-brand-analytics-metrics";
import { cn } from "@/lib/utils";

type SortField = "totalTips" | "totalAmount" | "firstTip" | "lastTip";

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
    <TableHead>
      <button
        onClick={() => onSort(field)}
        className={cn(
          "flex items-center gap-1 hover:text-accent-foreground",
          isCurrentSort && "text-accent-foreground",
        )}>
        {label}
        {isCurrentSort &&
          (currentSortDir === "asc" ? (
            <ChevronUp className="size-4 text-accent" />
          ) : (
            <ChevronDown className="size-4 text-accent" />
          ))}
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

export const DataContent = () => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("totalAmount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const limit = 10;

  const { data, isLoading, error } = useBrandAnalytics({
    page,
    limit,
    sortBy,
    sortDir,
  });

  const { data: metricsData, isLoading: isLoadingMetrics } =
    useBrandAnalyticsMetrics();

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

  if (error) {
    return (
      <div className="flex justify-center items-center w-full h-[400px] text-destructive">
        Error loading analytics data
      </div>
    );
  }

  // Only show full page loader if both metrics and table data are loading initially
  const isInitialLoad = isLoading && isLoadingMetrics;
  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center w-full h-[400px]">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col justify-start items-center w-full p-5 gap-5">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full relative">
        {isLoadingMetrics && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
        <StatsCard
          title="Total Tips Received"
          value={metricsData?.data.totalTips || 0}
        />
        <StatsCard
          title="Unique Tippers"
          value={metricsData?.data.uniqueTippers || 0}
        />
        <StatsCard
          title="Total Amount (USDC)"
          value={(metricsData?.data.totalAmount || 0).toFixed(2)}
        />
      </div>

      {/* Analytics Table */}
      <div className="w-full relative">
        {isLoading && !isInitialLoad && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <SortableTableHeader
                field="totalTips"
                label="Total Tips"
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
                field="firstTip"
                label="First Tip"
                currentSortField={sortBy}
                currentSortDir={sortDir}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="lastTip"
                label="Last Tip"
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
                <TableCell>{user.totalTips}</TableCell>
                <TableCell>{user.totalAmount} USDC</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.firstTip), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.lastTip), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
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
    </motion.div>
  );
};
