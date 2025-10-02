import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

type SortField = "totalTips" | "totalAmount" | "firstTip" | "lastTip";

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

  // Calculate total stats
  const totalStats = data?.data.reduce(
    (acc, user) => ({
      totalTips: acc.totalTips + user.totalTips,
      totalAmount: acc.totalAmount + user.totalAmount,
    }),
    { totalTips: 0, totalAmount: 0 },
  );

  if (error) {
    return (
      <div className="flex justify-center items-center w-full h-[400px] text-destructive">
        Error loading analytics data
      </div>
    );
  }

  if (isLoading) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <StatsCard
          title="Total Tips Received"
          value={totalStats?.totalTips || 0}
        />
        <StatsCard title="Unique Tippers" value={data?.pagination.total || 0} />
        <StatsCard
          title="Total Amount (USDC)"
          value={totalStats?.totalAmount.toFixed(2) || "0.00"}
        />
      </div>

      {/* Analytics Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("totalTips")}
                className={cn(
                  "flex items-center gap-1 hover:text-accent-foreground",
                  sortBy === "totalTips" && "text-accent-foreground",
                )}>
                Total Tips
                <ArrowUpDown
                  className={cn(
                    "size-4",
                    sortBy === "totalTips" &&
                      sortDir === "asc" &&
                      "rotate-180 text-accent",
                  )}
                />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("totalAmount")}
                className={cn(
                  "flex items-center gap-1 hover:text-accent-foreground",
                  sortBy === "totalAmount" && "text-accent-foreground",
                )}>
                Total Amount
                <ArrowUpDown
                  className={cn(
                    "size-4",
                    sortBy === "totalAmount" &&
                      sortDir === "asc" &&
                      "rotate-180 text-accent",
                  )}
                />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("firstTip")}
                className={cn(
                  "flex items-center gap-1 hover:text-accent-foreground",
                  sortBy === "firstTip" && "text-accent-foreground",
                )}>
                First Tip
                <ArrowUpDown
                  className={cn(
                    "size-4",
                    sortBy === "firstTip" &&
                      sortDir === "asc" &&
                      "rotate-180 text-accent",
                  )}
                />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("lastTip")}
                className={cn(
                  "flex items-center gap-1 hover:text-accent-foreground",
                  sortBy === "lastTip" && "text-accent-foreground",
                )}>
                Last Tip
                <ArrowUpDown
                  className={cn(
                    "size-4",
                    sortBy === "lastTip" &&
                      sortDir === "asc" &&
                      "rotate-180 text-accent",
                  )}
                />
              </button>
            </TableHead>
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
