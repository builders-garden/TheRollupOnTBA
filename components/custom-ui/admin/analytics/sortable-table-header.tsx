import { ChevronsUpDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { TableHead } from "@/components/shadcn-ui/table";
import { cn } from "@/lib/utils";

interface SortableTableHeaderProps<T extends string> {
  field: T;
  label: string;
  currentSortField: T;
  currentSortDir: "asc" | "desc";
  onSort: (field: T) => void;
}

export const SortableTableHeader = <T extends string>({
  field,
  label,
  currentSortField,
  currentSortDir,
  onSort,
}: SortableTableHeaderProps<T>) => {
  const isCurrentSort = field === currentSortField;

  return (
    <TableHead className="w-[18.75%]">
      <button
        onClick={() => onSort(field)}
        className={cn(
          "flex items-center gap-1 hover:text-muted-foreground cursor-pointer w-full",
          isCurrentSort && "text-foreground",
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
                  "size-4 text-muted-foreground transition-all duration-200",
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
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </TableHead>
  );
};
