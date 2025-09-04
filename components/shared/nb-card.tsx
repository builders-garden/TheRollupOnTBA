import { cn } from "@/lib/utils";

interface NBCardProps {
  className?: string;
  cardColor?: "black" | "blue";
  children: React.ReactNode;
}

export const NBCard = ({
  className,
  children,
  cardColor = "black",
}: NBCardProps) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center bg-background border rounded-lg p-2.5",
        cardColor === "black"
          ? "border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          : "border-accent shadow-[4px_4px_0px_0px_rgba(73,104,215,1)]",
        className,
      )}>
      {children}
    </div>
  );
};
