import Image from "next/image";
import { BottomNavbar } from "../mini-app/bottom-navbar";
import { BuyTokenModal } from "../mini-app/buy-token-modal";
import { NBButton } from "../mini-app/nb-button";
import { NBCard } from "../mini-app/nb-card";
import { Separator } from "../shadcn-ui/separator";
import { ShareButton } from "../shared/share-button";

export const StreamPage = () => {
  return (
    <div className="relative flex flex-col justify-center items-start h-full w-full">
      <iframe
        width="100%"
        height="265px"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=cBiXzo8PUe3GQ7dx"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />

      {/* Bottom Section */}
      <div className="flex flex-col justify-start items-center h-full w-full p-5 gap-5">
        {/* Title */}
        <div className="flex flex-col justify-center items-center w-full gap-0.5">
          <div className="flex justify-between items-center w-full">
            <h1 className="shrink-0 font-extrabold text-[20px]">
              The Memecoin Rug Problems
            </h1>
            <ShareButton
              linkCopied
              miniappUrl="https://farcaster.miniapp.builders"
              setLinkCopied={() => {}}
              buttonClassName="shrink-1 w-min"
            />
          </div>
          <div className="flex justify-start items-center w-full gap-1.5">
            <p>by</p>
            <Image
              src="/images/rollup_logo.png"
              alt="Rollup Logo"
              width={96}
              height={100}
            />
          </div>
        </div>

        <Separator className="w-full bg-[#C8C3AD]" />

        {/* Tip Buttons */}
        <div className="flex justify-between items-center w-full gap-2.5">
          <NBButton buttonColor="blue" onClick={() => {}}>
            <p className="text-[16px] font-extrabold">Tip $0.5</p>
          </NBButton>
          <NBButton buttonColor="blue" onClick={() => {}}>
            <p className="text-[16px] font-extrabold">Tip $1</p>
          </NBButton>
          <NBButton buttonColor="blue" onClick={() => {}}>
            <p className="text-[16px] font-extrabold">Tip $3</p>
          </NBButton>
          <NBButton buttonColor="blue" onClick={() => {}}>
            <p className="text-[16px] font-extrabold">Custom</p>
          </NBButton>
        </div>

        {/* Poll Card */}
        <NBCard className="w-full items-start gap-2.5">
          <div className="flex flex-col justify-center items-start">
            <h1 className="text-[24px] font-bold">
              ETH will flip BTC this cycle
            </h1>
            <div className="flex justify-start items-center gap-1.5">
              <div className="size-2 bg-[#41CB6E] rounded-full animate-pulse animate-infinite animate-ease-linear" />
              <p className="text-[14px] font-medium">4:05 left to vote</p>
            </div>
          </div>

          <div className="flex justify-between items-center w-full gap-2.5">
            <NBButton onClick={() => {}} className="bg-destructive w-full">
              <p className="text-white text-[24px] font-extrabold">Bear</p>
            </NBButton>
            <NBButton onClick={() => {}} className="bg-success w-full">
              <p className="text-white text-[24px] font-extrabold">Bull</p>
            </NBButton>
          </div>
        </NBCard>

        {/* Featured Tokens */}
        <div className="flex flex-col justify-center items-start w-full gap-2.5">
          <h1 className="text-[14px] font-bold">Featured Tokens</h1>
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <BuyTokenModal
              trigger={
                <NBButton className="w-full py-2.5">
                  <div className="flex justify-center items-center w-full gap-1.5">
                    <div className="size-4 bg-yellow-500 rounded-full border border-black" />
                    <p className="text-[16px] font-extrabold">Buy $LIMòN</p>
                  </div>
                </NBButton>
              }
              tokenName="LIMòN"
            />
            <BuyTokenModal
              trigger={
                <NBButton className="w-full py-2.5">
                  <div className="flex justify-center items-center w-full gap-1.5">
                    <div className="size-4 bg-black rounded-full border border-black" />
                    <p className="text-[16px] font-extrabold">Buy $DRONE</p>
                  </div>
                </NBButton>
              }
              tokenName="DRONE"
            />
            <BuyTokenModal
              trigger={
                <NBButton className="w-full py-2.5">
                  <div className="flex justify-center items-center w-full gap-1.5">
                    <div className="size-4 bg-gray-500 rounded-full border border-black" />
                    <p className="text-[16px] font-extrabold">Buy $CASO</p>
                  </div>
                </NBButton>
              }
              tokenName="CASO"
            />
          </div>
        </div>
      </div>

      {/* Floating Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
};
