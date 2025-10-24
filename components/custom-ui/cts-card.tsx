import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CTSCardProps {
  className?: string;
  children: React.ReactNode;
  brandSlug?: string;
}

interface TheRollupCardProps {
  className?: string;
  cardColor?: "black" | "blue";
  children: React.ReactNode;
}

const TheRollupCard = ({
  className,
  children,
  cardColor = "black",
}: TheRollupCardProps) => {
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

export const CTSCard = ({ className, children, brandSlug }: CTSCardProps) => {
  // If brandSlug is the Rollup, use TheRollupCard component
  if (brandSlug === THE_ROLLUP_BRAND_SLUG) {
    return <TheRollupCard className={className}>{children}</TheRollupCard>;
  }

  // Default CTS card for other brands
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
