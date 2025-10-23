import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTSButton } from "../cts-button";

interface AdminTabsProps {
  tabButtons: {
    label: string;
    onClick: () => void;
    isSelected: boolean;
  }[];
}

export const AdminTabs = ({ tabButtons }: AdminTabsProps) => {
  return (
    <div className="flex justify-start items-center w-full py-5 px-2.5 gap-5 border-b-[1px] border-border">
      {tabButtons.map((tabButton) => (
        <CTSButton
          key={tabButton.label}
          className={cn(
            "rounded-full w-fit hover:bg-secondary/20",
            tabButton.isSelected && "bg-secondary/20 border border-secondary",
          )}
          variant={tabButton.isSelected ? "default" : "outline"}
          onClick={tabButton.onClick}>
          <div className="flex justify-start items-center w-full gap-2">
            <Sparkle
              className={cn(
                "size-6 text-foreground",
                tabButton.isSelected && "text-secondary",
              )}
            />
            <p
              className={cn(
                "text-xl font-bold text-foreground",
                tabButton.isSelected && "text-secondary-foreground",
              )}>
              {tabButton.label}
            </p>
          </div>
        </CTSButton>
      ))}
    </div>
  );
};
