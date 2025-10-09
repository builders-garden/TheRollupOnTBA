import sdk from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { Host } from "@/lib/database/db.schema";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  hosts: Host[];
  label: string;
  labelClassName?: string;
  hostNameClassName?: string;
  fromWebApp?: boolean;
}

export const HostsSection = ({
  hosts,
  label,
  labelClassName,
  hostNameClassName,
  fromWebApp,
}: AboutSectionProps) => {
  // Handles opening the Farcaster profile
  const handleOpenFarcasterProfile = async (
    farcasterUsername: string | null,
    fid?: number,
  ) => {
    if (fromWebApp && farcasterUsername) {
      window.open(`https://farcaster.xyz/${farcasterUsername}`, "_blank");
    } else if (!!fid && !fromWebApp) {
      await sdk.actions.viewProfile({
        fid,
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className={cn("text-sm font-bold", labelClassName)}>{label}</h1>
      <div className="flex justify-start items-center w-full gap-5">
        {hosts.map((host) => (
          <div
            key={host.fid}
            className="flex flex-col justify-center items-center cursor-pointer gap-2"
            onClick={() =>
              handleOpenFarcasterProfile(host.farcasterUsername, host.fid)
            }>
            <Image
              src={host.avatarUrl || ""}
              alt={host.farcasterUsername || ""}
              width={244}
              height={244}
              className="size-14 rounded-[12px] object-cover"
            />
            <p className={cn("text-xs font-bold", hostNameClassName)}>
              {host.farcasterUsername}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
