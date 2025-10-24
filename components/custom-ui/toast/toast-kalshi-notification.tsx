"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useKalshiGet } from "@/hooks/use-kalshi-get";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { ServerToClientSocketEvents } from "@/lib/enums";
import { KalshiMarketStartedEvent } from "@/lib/types/socket/server-to-client.type";

export interface KalshiNotificationData {
  id: string; // ID stored in the database
  brandId: string;
  kalshiUrl: string;
  kalshiEventId: string;
  position: string;
}

export const ToastKalshiNotification = ({
  data,
}: {
  data: KalshiNotificationData;
}) => {
  console.log("ToastKalshiNotification mounted with data:", data);

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

  // Render single market
  const renderSingleMarket = (market: {
    title: string;
    yesPrice: string;
    noPrice: string;
  }) => {
    const yesPercentage = Math.round(parseFloat(market.yesPrice) * 100);
    const noPercentage = 100 - yesPercentage;

    return (
      <div className="bg-gradient-to-b bg-[#1B2541] rounded-xl shadow-lg px-6 py-4 min-w-[800px] border-4 border-[#E6B45E]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-green-500 font-bold text-2xl">YES</div>
              <div className="text-white font-black text-3xl">
                {yesPercentage}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-red-500 font-bold text-2xl">NO</div>
              <div className="text-white font-black text-3xl">
                {noPercentage}%
              </div>
            </div>
          </div>

          <div className="flex-1 text-center">
            <h3 className="text-white font-bold text-xl mb-2">
              {kalshiData?.success ? kalshiData.data.eventTitle : "Market"}
            </h3>
            <p className="text-gray-300 text-sm">{market.title}</p>
          </div>

          <div className="text-center">
            <div className="text-[#E6B45E] font-bold text-lg">Kalshi</div>
            <div className="text-gray-400 text-sm">Market</div>
          </div>
        </div>
      </div>
    );
  };

  // Render multiple markets
  const renderMultipleMarkets = () => {
    if (!kalshiData?.success || !kalshiData.data.markets) return null;

    return (
      <div className="bg-gradient-to-b bg-[#1B2541] rounded-xl shadow-lg px-6 py-4 min-w-[900px] border-4 border-[#E6B45E]">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-xl mb-2">
            {kalshiData.data.eventTitle}
          </h3>
          <p className="text-gray-300 text-sm">
            {kalshiData.data.totalMarkets} markets available
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {kalshiData.data.markets.slice(0, 3).map(
            (
              market: {
                title: string;
                yesPrice: string;
                noSubTitle: string;
                ticker: string;
              },
              index: number,
            ) => {
              const yesPercentage = Math.round(
                parseFloat(market.yesPrice) * 100,
              );
              const candidateName = market.noSubTitle || `Option ${index + 1}`;

              return (
                <div
                  key={market.ticker}
                  className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-sm mb-1">
                    {candidateName}
                  </div>
                  <div className="text-green-500 font-black text-xl">
                    {yesPercentage}%
                  </div>
                  <div className="text-gray-400 text-xs">Yes</div>
                </div>
              );
            },
          )}
        </div>

        {kalshiData.data.totalMarkets > 3 && (
          <div className="text-center mt-3">
            <span className="text-gray-400 text-sm">
              +{kalshiData.data.totalMarkets - 3} more markets
            </span>
          </div>
        )}

        <div className="text-center mt-4">
          <div className="text-[#E6B45E] font-bold text-lg">Kalshi</div>
          <div className="text-gray-400 text-sm">Prediction Markets</div>
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
              className="bg-gradient-to-b bg-[#1B2541] rounded-xl shadow-lg px-6 py-8 min-w-[600px] border-4 border-[#E6B45E] flex justify-center items-center">
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
              className="bg-gradient-to-b bg-[#1B2541] rounded-xl shadow-lg px-6 py-8 min-w-[600px] border-4 border-red-500 flex justify-center items-center">
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
