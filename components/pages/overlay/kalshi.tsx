"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ToastKalshiNotification } from "@/components/custom-ui/toast/toast-kalshi-notification";
import { useSocket } from "@/hooks/use-socket";
import { Brand } from "@/lib/database/db.schema";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import { KalshiMarketStartedEvent } from "@/lib/types/socket/server-to-client.type";

export const OverlayKalshi = ({ brand }: { brand: Brand }) => {
  const { subscribe, unsubscribe } = useSocket();

  // Unified Kalshi market state and visibility flag
  type NormalizedKalshiMarket = {
    id: string;
    brandId: string;
    kalshiUrl: string;
    kalshiEventId: string;
    position: PopupPositions;
  };

  const [_kalshiMarket, setKalshiMarket] =
    useState<NormalizedKalshiMarket | null>(null);
  const [showKalshiMarket, setShowKalshiMarket] = useState<boolean>(false);

  const toastId = useMemo(() => `kalshi-market-${brand.id}`, [brand]);

  const openToastFromKalshiMarket = useCallback(
    (market: NormalizedKalshiMarket) => {
      console.log("Opening toast with market data:", market);
      console.log("Toast ID:", toastId);
      console.log("Toast position:", market.position);

      toast.custom(
        () => (
          <ToastKalshiNotification
            data={{
              id: market.id,
              brandId: market.brandId,
              kalshiUrl: market.kalshiUrl,
              kalshiEventId: market.kalshiEventId,
              position: market.position,
            }}
          />
        ),
        {
          id: toastId,
          duration: Infinity,
          position: market.position,
          className: "flex items-center justify-center w-full",
        },
      );

      console.log("Toast.custom() called successfully");
    },
    [toastId],
  );

  // Handle Kalshi market started event
  const handleKalshiMarketStarted = useCallback(
    (data: KalshiMarketStartedEvent) => {
      console.log("Received Kalshi market started event:", data);
      console.log("Event brandId:", data.brandId);
      console.log("Current brandId:", brand.id);
      console.log("Brand match:", data.brandId === brand.id);

      // Only show if it's for this brand
      if (data.brandId !== brand.id) {
        console.log("Event not for this brand, ignoring");
        return;
      }

      console.log("Processing Kalshi market event for this brand");

      const normalized: NormalizedKalshiMarket = {
        id: data.id,
        brandId: data.brandId,
        kalshiUrl: data.kalshiUrl,
        kalshiEventId: data.kalshiEventId,
        position: data.position,
      };

      console.log("Normalized market data:", normalized);
      setKalshiMarket(normalized);
      setShowKalshiMarket(true);
      console.log("Opening toast...");
      openToastFromKalshiMarket(normalized);
    },
    [brand.id, openToastFromKalshiMarket],
  );

  // Subscribe to socket events
  useEffect(() => {
    console.log("subscribe to kalshi market started event");
    console.log("brand.id", brand.id);
    subscribe(
      ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
      handleKalshiMarketStarted,
    );

    // TEMPORARY: Test the toast by manually triggering an event after 5 seconds
    const testTimer = setTimeout(() => {
      console.log("🧪 TESTING: Manually triggering Kalshi market event");
      const testEvent: KalshiMarketStartedEvent = {
        id: "test-kalshi-market-123",
        brandId: brand.id,
        kalshiUrl: "https://kalshi.com/events/KXFEDDECISION-25OCT",
        kalshiEventId: "KXFEDDECISION-25OCT",
        position: PopupPositions.TOP_CENTER,
      };
      handleKalshiMarketStarted(testEvent);
    }, 5000);

    return () => {
      clearTimeout(testTimer);
      unsubscribe(
        ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
        handleKalshiMarketStarted,
      );
    };
  }, [subscribe, unsubscribe, handleKalshiMarketStarted, brand.id]);

  // Clean up toast when component unmounts or market changes
  useEffect(() => {
    if (!showKalshiMarket) {
      toast.dismiss(toastId);
    }
  }, [showKalshiMarket, toastId]);

  return (
    <div className="flex items-center justify-center min-h-[130px] w-[1000px]">
      <div className="flex h-full w-full">
        {/* Empty container - toast will be displayed by sonner */}
      </div>
    </div>
  );
};
