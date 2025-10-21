import { cn } from "@/lib/utils";

interface CTSCardProps {
  className?: string;
  children: React.ReactNode;
}

export const CTSCard = ({ className, children }: CTSCardProps) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center bg-card rounded-lg p-2.5",
        className,
      )}>
      {children}
    </div>
  );
};
