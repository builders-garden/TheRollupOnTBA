import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import { useBrandNotificationsByBrandId } from "@/hooks/use-brand-notifications";
import { AuthTokenType } from "@/lib/enums";

// Max items per page for tips analytics
const MAX_ITEMS_PER_PAGE = 10;

export const HistoryContent = () => {
  const { brand } = useAdminAuth();

  const [page, setPage] = useState(1);

  const {
    data: notificationsHistoryData,
    isLoading: isLoadingNotificationsHistory,
    error: errorNotificationsHistory,
  } = useBrandNotificationsByBrandId({
    page,
    limit: MAX_ITEMS_PER_PAGE,
    tokenType: AuthTokenType.ADMIN_AUTH_TOKEN,
    brandId: brand?.data?.id,
  });

  return (
    <AnimatePresence mode="wait">
      {isLoadingNotificationsHistory ? (
        <motion.div
          key="loading-tips-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex justify-center items-center w-full h-[256px]">
          <Loader2 className="size-10 text-black animate-spin" />
        </motion.div>
      ) : errorNotificationsHistory ? (
        <motion.div
          key="error-tips-content"
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
          key="notifications-history-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex flex-col justify-start items-center w-full p-5 gap-5">
          {/* Analytics Table */}
          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {isLoadingNotificationsHistory && (
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
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead className="w-full">Message</TableHead>
                  <TableHead className="w-[20%]">Reached Users</TableHead>
                  <TableHead className="w-[25%]">Creation Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationsHistoryData?.data.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="text-base font-medium break-words whitespace-normal max-w-0">
                      {notification.title}
                    </TableCell>
                    <TableCell className="text-base font-medium break-words whitespace-normal max-w-0">
                      {notification.body}
                    </TableCell>
                    <TableCell className="text-base font-medium">
                      {notification.totalTargetUsers}
                    </TableCell>
                    <TableCell className="text-base font-medium">
                      {notification.createdAt
                        ? formatDistanceToNow(
                            new Date(notification.createdAt + "Z"),
                            {
                              addSuffix: true,
                              includeSeconds: true,
                            },
                          )
                        : "Unknown"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {notificationsHistoryData?.pagination?.totalPages &&
          notificationsHistoryData.pagination.totalPages > 0 ? (
            <div className="flex justify-center items-center gap-4 pt-4">
              <NBButton
                variant="outline"
                className="p-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}>
                <ChevronLeft className="size-4" />
              </NBButton>

              <span className="text-sm">
                Page {notificationsHistoryData?.pagination.page} of{" "}
                {notificationsHistoryData?.pagination.totalPages}
              </span>

              <NBButton
                variant="outline"
                className="p-2"
                onClick={() => setPage((p) => p + 1)}
                disabled={!notificationsHistoryData?.pagination.hasMore}>
                <ChevronRight className="size-4" />
              </NBButton>
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
