import { LogOut } from "lucide-react";
import { NBButton } from "./nb-button";

interface LogoutButtonProps {
  executeLogout: () => void;
}

export const LogoutButton = ({ executeLogout }: LogoutButtonProps) => {
  return (
    <NBButton buttonColor="red" className="w-full" onClick={executeLogout}>
      <div className="flex justify-start items-center w-full gap-2">
        <LogOut className="size-5 text-destructive" />
        <p className="text-xl font-bold text-destructive">Logout</p>
      </div>
    </NBButton>
  );
};
