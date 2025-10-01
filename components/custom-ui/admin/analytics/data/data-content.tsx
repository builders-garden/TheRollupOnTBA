import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
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

export const DataContent = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useBrandAnalytics({
    brandSlug,
    page,
    limit,
  });

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
      {/* Analytics Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Total Tips</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>First Tip</TableHead>
            <TableHead>Last Tip</TableHead>
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
                <span className="font-medium">
                  {user.farcasterDisplayName ||
                    user.farcasterUsername ||
                    user.username}
                </span>
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

      {/* Total Stats */}
      <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
        Total Users: {data?.pagination.total}
      </div>
    </motion.div>
  );
};
