import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTSButton } from "./cts-button";

interface LogoutButtonProps {
  executeLogout: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const LogoutButton = ({
  executeLogout,
  className,
  children,
  disabled,
}: LogoutButtonProps) => {
  return (
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
  );
};
