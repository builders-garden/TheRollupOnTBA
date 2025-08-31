import { CircleUserIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function UserAvatar({
  avatarUrl,
  size,
}: {
  avatarUrl: string | null;
  size: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  if (!avatarUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full",
          size === "xs"
            ? "h-6 w-6 border border-black"
            : "h-8 w-8 border-2 border-black",
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full",
        size === "xs"
          ? "h-6 w-6 border border-black"
          : "h-8 w-8 border-2 border-black",
        size === "md"
          ? "h-10 w-10 border-2 border-black"
          : size === "lg"
            ? "h-12 w-12 border-2 border-black"
            : size === "xl"
              ? "h-14 w-14 border-2 border-black"
              : "",
      )}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Viewer"
          fill
          sizes="100px"
          className="object-cover w-full h-full"
        />
      ) : (
        <CircleUserIcon className="w-6 h-6 text-muted-foreground" />
      )}
    </div>
  );
}
