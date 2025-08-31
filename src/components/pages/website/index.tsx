import { BookOpenText } from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { env } from "@/lib/env";

export const Website = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <main className="bg-[#FCF5EC] text-black h-screen w-full overflow-y-auto p-4 sm:p-0">
      <div className="w-full max-w-7xl mx-auto min-h-full flex flex-col sm:flex-row gap-4 sm:gap-24 items-center justify-center py-4 sm:py-12 mb-32">
        {/* Phone Preview */}
        {/* <div className="relative w-[200px] sm:w-[320px] h-[400px] sm:h-[640px] rounded-[32px] sm:rounded-[40px] bg-black border border-zinc-900 sm:border-2 shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[16px] sm:h-[30px] bg-black rounded-b-[16px] sm:rounded-b-[20px] border-x border-b sm:border-x-2 sm:border-b-2 border-zinc-900" />
          <div className="absolute inset-2 sm:inset-3 rounded-[28px] sm:rounded-[32px] overflow-hidden bg-gray-800">
            <video
              src=""
              autoPlay
              loop
              muted={isMuted}
              className="w-full h-full object-cover opacity-90"
            />
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 p-2 sm:p-4 bg-black/70 rounded-full hover:bg-black/95 transition-colors w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        </div> */}

        {/* Content Section */}
        <div className="flex flex-col gap-4 sm:gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-6 items-center">
              <Image
                src="/images/splash.png"
                alt="Starter Logo"
                className="h-16 sm:h-20 w-16 sm:w-20 object-contain"
                width={96}
                height={96}
              />
              <div className="flex flex-col">
                <h1 className=" text-lg sm:text-2xl font-bold">Starter</h1>
                <p className="text-black/70 text-xs sm:text-base">
                  Built by{" "}
                  <a
                    href="https://builders.garden"
                    target="_blank"
                    className="text-black/90 underline hover:text-black transition-colors">
                    Builders Garden
                  </a>{" "}
                  team
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-lg text-black/80">Starter</p>
          </div>

          <div className="flex flex-row gap-0 sm:gap-4">
            <div className="flex flex-col gap-0 sm:gap-4">
              <div className="hidden sm:block w-fit rounded-xl p-2 bg-white backdrop-blur-sm border-2 border-black/20">
                <QRCodeSVG
                  value={`${env.NEXT_PUBLIC_URL}/farcaster/miniapp`}
                  className="w-fit rounded-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full sm:w-fit">
              <a
                href={`${env.NEXT_PUBLIC_URL}/farcaster/miniapp`}
                target="_blank"
                className="w-full p-4 bg-[#8A63D2] text-white rounded-xl flex flex-row gap-4 items-center justify-start transition-transform hover:scale-105">
                <svg
                  width="100"
                  height="100"
                  className="w-10 h-10"
                  viewBox="0 0 1000 1000"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"
                    fill="white"
                  />
                  <path
                    d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"
                    fill="white"
                  />
                  <path
                    d="M675.556 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"
                    fill="white"
                  />
                </svg>

                <span className="text-xs sm:text-lg font-medium">
                  Play on Farcaster
                </span>
              </a>

              <a
                href={`https://docs.${new URL(env.NEXT_PUBLIC_URL).hostname}/`}
                target="_blank"
                className="w-full p-4 border-2 border-white bg-white backdrop-blur-sm text-black text-left rounded-xl flex flex-row gap-4 items-center justify-start transition-transform hover:scale-105">
                <BookOpenText className="w-10 h-10" />
                <span className="text-xs sm:text-lg font-medium">
                  How it works
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
