import { LogOut } from "lucide-react";
import { motion } from "motion/react";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CTSButton } from "./cts-button";
import { TheRollupButton } from "./tr-button";

interface LogoutButtonProps {
  executeLogout: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  brandSlug?: string;
}

export const LogoutButton = ({
  executeLogout,
  className,
  children,
  disabled,
  brandSlug,
}: LogoutButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex justify-center items-center min-w-1/3 w-1/3">
      {brandSlug === THE_ROLLUP_BRAND_SLUG ? (
        <TheRollupButton
          buttonColor="red"
          className={cn("w-full", className)}
          variant="outline"
          onClick={executeLogout}
          disabled={disabled}>
          {children || (
            <div className="flex justify-start items-center w-full gap-2">
              <LogOut className="size-5 text-muted" />
              <p className="text-xl font-bold text-muted">Logout</p>
            </div>
          )}
        </TheRollupButton>
      ) : (
        <CTSButton
          className={cn("w-full", className)}
          variant="outline"
          onClick={executeLogout}
          disabled={disabled}>
          {children || (
            <div className="flex justify-start items-center w-full gap-2">
              <LogOut className="size-5 text-muted" />
              <p className="text-xl font-bold text-muted">Logout</p>
            </div>
          )}
        </CTSButton>
      )}
    </motion.div>
  );
};
