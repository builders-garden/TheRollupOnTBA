"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";
import { NumberTicker } from "@/components/shadcn-ui/number-ticker";
import { useKalshiGet } from "@/hooks/use-kalshi-get";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { ServerToClientSocketEvents } from "@/lib/enums";
import { KalshiMarketStartedEvent } from "@/lib/types/socket/server-to-client.type";
import { cn } from "@/lib/utils";

export interface KalshiNotificationData {
  id: string; // ID stored in the database
  brandId: string;
  kalshiUrl: string;
  kalshiEventId: string;
  position: string;
}

export const ToastKalshiNotification = ({
  data,
  brandSlug,
}: {
  data: KalshiNotificationData;
  brandSlug: string;
}) => {
  console.log("ToastKalshiNotification mounted with data:", data);

  // Whether the brand is the Rollup
  const isBrandTheRollup = brandSlug === THE_ROLLUP_BRAND_SLUG;
  console.log("brandSlug", brandSlug);

  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();
  const kalshiGetMutation = useKalshiGet();

  // Use the mutation's built-in state instead of managing our own
  const kalshiData = kalshiGetMutation.data || null;
  const isLoading = kalshiGetMutation.isPending;
  const error = kalshiGetMutation.error ? "Failed to load market data" : null;

  // Create event handler for Kalshi market started event
  const handleKalshiMarketStarted = (eventData: KalshiMarketStartedEvent) => {
    console.log("Received Kalshi market started event:", eventData);
    // This component is already handling the specific market, so we can ignore updates
    // or refresh the data if needed
  };

  // Subscribe to socket events
  useEffect(() => {
    // Join the stream
    joinStream({
      brandId: data.brandId,
      username: "Kalshi Market",
      profilePicture: "https://via.placeholder.com/150",
    });

    // Subscribe to Kalshi market events
    console.log("subscribe to kalshi market started event");
    console.log("data", data);
    subscribe(
      ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
      handleKalshiMarketStarted,
    );

    return () => {
      unsubscribe(
        ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
        handleKalshiMarketStarted,
      );
    };
  }, [data.brandId, joinStream, subscribe, unsubscribe]);

  // Fetch Kalshi market data when component mounts
  useEffect(() => {
    console.log("Fetching Kalshi data for URL:", data.kalshiUrl);

    // Trigger the mutation only once when component mounts
    kalshiGetMutation.mutate({
      url: data.kalshiUrl,
    });
  }, [data.kalshiUrl]); // Only depend on the URL, not the mutation

  // Compute directional offsets based on toast position
  const isLeft = data.position?.includes("left");
  const isRight = data.position?.includes("right");
  const isCenter = data.position?.includes("center");
  const isTop = data.position?.startsWith("top");
  const xOffset = isLeft ? 100 : isRight ? -100 : 0;
  const yOffset = isCenter ? (isTop ? 100 : -100) : 0;

  // Percentage results bar (mirrors poll ResultsBar but uses YES/NO)
  const ResultsBarYesNo = ({
    yesPercent,
    noPercent,
  }: {
    yesPercent: number;
    noPercent: number;
  }) => {
    const clampedYes = Math.max(0, Math.min(100, yesPercent));
    const clampedNo = Math.max(0, Math.min(100, noPercent));
    const total = clampedYes + clampedNo;
    const normalizedYes = total === 0 ? 50 : (clampedYes / total) * 100;
    const normalizedNo = 100 - normalizedYes;

    const yesSizeClass =
      normalizedYes < 8
        ? "text-xs"
        : normalizedYes < 16
          ? "text-lg"
          : "text-2xl";
    const noSizeClass =
      normalizedNo < 8 ? "text-xs" : normalizedNo < 16 ? "text-lg" : "text-2xl";
    const yesStack = normalizedYes < 10;
    const noStack = normalizedNo < 10;

    return (
      <motion.div
        className={cn(
          "flex items-center w-full min-w-[1000px] rounded-xl overflow-hidden border-4",
          isBrandTheRollup ? "border-[#E6B45E]" : "border-white",
        )}
        initial={{ opacity: 0, scale: 0, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          duration: 0.4,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          rotate: { type: "spring", visualDuration: 0.45, bounce: 0.3 },
        }}>
        <motion.div
          className={cn(
            "h-14 flex items-center justify-center bg-[#CF5953]",
            normalizedNo > 0 ? "px-2" : "px-0",
          )}
          initial={{ width: "50%" }}
          animate={{ width: `${normalizedNo}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 60,
            delay: 0.45,
          }}>
          {noStack ? (
            <div
              className={cn(
                "flex flex-col items-center leading-4 text-white font-overused-grotesk font-black",
                noSizeClass,
              )}>
              <div>NO</div>
              <div className="flex items-center gap-0.5">
                <NumberTicker
                  value={normalizedNo}
                  startValue={50}
                  className={cn("tracking-tighter text-white", noSizeClass)}
                  delay={0.45}
                />
                %
              </div>
            </div>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1 text-white font-overused-grotesk font-black tracking-tighter shrink-0",
                noSizeClass,
              )}>
              NO
              <NumberTicker
                value={normalizedNo}
                startValue={50}
                className={cn("tracking-tighter text-white", noSizeClass)}
                delay={0.45}
              />
              %
            </span>
          )}
        </motion.div>
        <motion.div
          className={cn(
            "h-14 flex items-center justify-center bg-[#4CAF50]",
            normalizedYes > 0 ? "px-2" : "px-0",
          )}
          initial={{ width: "50%" }}
          animate={{ width: `${normalizedYes}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 60,
            delay: 0.45,
          }}>
          {yesStack ? (
            <div
              className={cn(
                "flex flex-col items-center leading-4 text-white font-overused-grotesk font-black",
                yesSizeClass,
              )}>
              <div>YES</div>
              <div className="flex items-center gap-0.5">
                <NumberTicker
                  value={normalizedYes}
                  startValue={50}
                  className={cn("tracking-tighter text-white", yesSizeClass)}
                  delay={0.45}
                />
                %
              </div>
            </div>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1 text-white font-overused-grotesk font-black tracking-tighter shrink-0",
                yesSizeClass,
              )}>
              YES
              <NumberTicker
                value={normalizedYes}
                startValue={50}
                className={cn("tracking-tighter text-white", yesSizeClass)}
                delay={0.45}
              />
              %
            </span>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // Render single market
  const renderSingleMarket = (_market: {
    title: string;
    yesPrice: string;
    noPrice: string;
  }) => {
    const yesPercentage = Math.round(parseFloat(_market.yesPrice) * 100);
    const noPercentage = Math.max(0, 100 - yesPercentage);

    const options = [
      { name: "YES", pct: yesPercentage },
      { name: "NO", pct: noPercentage },
    ].sort((a, b) => b.pct - a.pct);
    const maxPct = options.reduce((acc, o) => (o.pct > acc ? o.pct : acc), 0);

    return (
      <div
        className={cn(
          "rounded-xl shadow-lg px-6 py-4 min-w-[1000px] min-h-[100px] border-4",
          isBrandTheRollup
            ? "bg-[#1B2541] border-[#E6B45E]"
            : "bg-background border-primary",
        )}>
        {/* Header: centered title + QR + green label */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 pr-24">
            <h3 className="text-white font-black text-[34px] leading-9 text-center">
              {kalshiData?.success ? kalshiData.data.eventTitle : _market.title}
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="bg-white p-1">
              <QRCodeSVG value={data.kalshiUrl} size={66} level="M" />
            </div>
            <div className="text-[#00d296] font-bold text-lg mt-1">
              Powered by Kalshi
            </div>
          </div>
        </div>
        <div className="h-px bg-white/20 mt-3" />

        {/* Options list: two bars YES/NO */}
        <div className="mt-4">
          <div className="flex flex-col gap-3">
            {options.map((o) => {
              const isYes = o.name === "YES";
              return (
                <div key={o.name} className="w-full">
                  <div className="relative h-10 rounded-md overflow-hidden border border-white/40 bg-[#2f2f2f]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${o.pct}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 60,
                      }}
                      className={cn(
                        "absolute inset-y-0 left-0",
                        isYes ? "bg-[#4CAF50]" : "bg-[#CF5953]",
                      )}
                    />

                    <div className="relative z-10 h-full flex items-center justify-between px-3">
                      <span className="text-white font-bold text-xl">
                        {o.name}
                      </span>
                      <span className="text-white font-black text-xl">
                        {o.pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render multiple markets
  const renderMultipleMarkets = () => {
    if (!kalshiData?.success || !kalshiData.data.markets) return null;

    // Build list with bars like the reference
    const marketsAll = kalshiData.data.markets as Array<{
      title: string;
      yesPrice: string;
      noSubTitle?: string;
      ticker: string;
    }>;

    const scoredAll = marketsAll.map((m, i) => ({
      index: i,
      name: m.noSubTitle || m.title || `Option ${i + 1}`,
      pct: Math.round(parseFloat(m.yesPrice) * 100),
      ticker: m.ticker,
    }));

    const scored = scoredAll.slice(0, 3);
    const extraCount = Math.max(0, scoredAll.length - 3);
    const maxPct = scored.reduce((acc, m) => (m.pct > acc ? m.pct : acc), 0);

    return (
      <div
        className={cn(
          "rounded-xl shadow-lg px-6 py-4 min-w-[1000px] min-h-[100px] border-4",
          isBrandTheRollup
            ? "bg-[#1B2541] border-[#E6B45E]"
            : "bg-background border-primary",
        )}>
        {/* Header: title + QR */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 pr-24">
            <h3 className="text-white font-black text-[34px] leading-9 text-center">
              {kalshiData.data.eventTitle}
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="bg-white p-1">
              <QRCodeSVG value={data.kalshiUrl} size={66} level="M" />
            </div>
            <div className="text-[#00d296] font-bold text-lg mt-1">
              Powered by Kalshi
            </div>
          </div>
        </div>
        <div className="h-px bg-white/20 mt-3" />

        {/* Options list */}
        <div className="mt-4">
          <div className="flex flex-col gap-3">
            {scored.map((m) => {
              const isLeader = m.pct === maxPct;
              return (
                <div key={m.ticker} className="w-full">
                  <div className="relative h-10 rounded-md overflow-hidden border border-white/40 bg-[#2f2f2f]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 60,
                      }}
                      className={cn(
                        "absolute inset-y-0 left-0",
                        isLeader ? "bg-[#00d296]" : "bg-[#4b4b4b]",
                      )}
                    />

                    <div className="relative z-10 h-full flex items-center justify-between px-3">
                      <span className="text-white font-semibold text-base">
                        {m.name}
                      </span>
                      <span className="text-white font-black text-xl">
                        {m.pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {extraCount > 0 && (
            <div className="text-center mt-3">
              <span className="text-white text-sm">
                +{extraCount} more markets
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        key={data.id}
        initial={{
          opacity: 0,
          x: xOffset,
          y: yOffset,
          scale: 0.75,
        }}
        animate={{
          opacity: 1,
          y: 0,
          x: 0,
          scale: [0.75, 1.2, 1],
          transition: {
            duration: 0.9,
            ease: [0.19, 1.0, 0.22, 1.0],
            opacity: { duration: 0.2 },
            scale: { times: [0, 0.6, 1], duration: 0.9 },
          },
        }}
        exit={{
          opacity: 0,
          x: xOffset ? -xOffset : 0,
          y: yOffset ? -yOffset : 50,
          scale: 0.8,
          transition: { duration: 0.4 },
        }}
        className="flex flex-col gap-1 font-overused-grotesk w-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className={cn(
                "rounded-xl shadow-lg px-6 py-8 min-w-[1000px] min-h-[100px] border-4 flex justify-center items-center",
                isBrandTheRollup
                  ? "bg-[#1B2541] border-[#E6B45E]"
                  : "bg-background border-primary",
              )}>
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-8 text-[#E6B45E] animate-spin" />
                <div className="text-white font-bold text-lg">
                  Loading Kalshi Market...
                </div>
                <div className="text-gray-400 text-sm">Fetching live data</div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-xl shadow-lg px-6 py-8 min-w-[1000px] min-h-[100px] border-4 flex justify-center items-center",
                isBrandTheRollup
                  ? "bg-[#1B2541] border-red-500"
                  : "bg-background border-red-500",
              )}>
              <div className="text-center">
                <div className="text-red-500 font-bold text-lg mb-2">Error</div>
                <div className="text-white text-sm">{error}</div>
              </div>
            </motion.div>
          ) : kalshiData?.success && kalshiData.data ? (
            <motion.div
              key="market-data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>
              {kalshiData.data.totalMarkets === 1
                ? renderSingleMarket(kalshiData.data.markets[0])
                : renderMultipleMarkets()}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
