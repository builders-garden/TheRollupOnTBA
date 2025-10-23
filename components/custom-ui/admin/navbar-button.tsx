import { cn } from "@/lib/utils";
import { CTSButton } from "../cts-button";

interface NavbarButtonProps {
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export const NavbarButton = ({
  label,
  icon,
  isSelected,
  onClick,
}: NavbarButtonProps) => {
  return (
    <CTSButton
      className={cn(
        "w-full hover:bg-transparent",
        isSelected && "bg-foreground hover:bg-foreground",
      )}
      variant={isSelected ? "default" : "ghost"}
      onClick={onClick}>
      <div
        className={cn(
          "flex justify-start items-center w-full gap-2",
          !isSelected && "text-foreground",
        )}>
        {icon}
        <p className="text-xl font-bold">{label}</p>
      </div>
    </CTSButton>
  );
};
