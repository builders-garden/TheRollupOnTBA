import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NBButton } from "./nb-button";

interface LogoutButtonProps {
  executeLogout: () => void;
  className?: string;
}

export const LogoutButton = ({
  executeLogout,
  className,
}: LogoutButtonProps) => {
  return (
    <NBButton
      buttonColor="red"
      className={cn("w-full", className)}
      onClick={executeLogout}>
      <div className="flex justify-start items-center w-full gap-2">
        <LogOut className="size-5 text-destructive" />
        <p className="text-xl font-bold text-destructive">Logout</p>
      </div>
    </NBButton>
  );
};
