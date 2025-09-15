import sdk from "@farcaster/miniapp-sdk";
import Image from "next/image";

interface AboutSectionProps {
  hosts: {
    name: string;
    pictureUrl: string;
    fid: number;
    farcasterUsername: string;
  }[];
  label: string;
}

export const HostsSection = ({ hosts, label }: AboutSectionProps) => {
  // Handles opening the Farcaster profile
  const handleOpenFarcasterProfile = async (fid: number) => {
    await sdk.actions.viewProfile({
      fid,
    });
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">{label}</h1>
      <div className="flex justify-start items-center w-full gap-5">
        {hosts.map((host) => (
          <div
            key={host.name}
            className="flex flex-col justify-center items-center cursor-pointer gap-2"
            onClick={() => handleOpenFarcasterProfile(host.fid)}>
            <Image
              src={host.pictureUrl}
              alt={host.name}
              width={244}
              height={244}
              className="size-14 rounded-[12px] object-cover"
            />
            <p className="text-xs font-bold">{host.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
