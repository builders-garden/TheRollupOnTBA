import { motion } from "motion/react";
import { useState } from "react";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useKalshiGet } from "@/hooks/use-kalshi-get";
import { useKalshiStore } from "@/hooks/use-kalshi-store";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { PopupPositions } from "@/lib/enums";
import { KalshiApiResult } from "@/lib/types/kalshi.type";
import { KalshiConfirmation } from "./kalshi-confirmation";

export const KalshiContent = () => {
  const { brand, admin } = useAdminAuth();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<KalshiApiResult | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Initialize hooks
  const kalshiGetMutation = useKalshiGet();
  const kalshiStoreMutation = useKalshiStore();
  const { adminStartKalshiMarket } = useSocketUtils();

  const onConfirm = async () => {
    if (!url.trim()) return;

    setResult(null);
    setIsConfirmed(false);

    try {
      const response = await kalshiGetMutation.mutateAsync({ url });
      setResult(response as KalshiApiResult);
    } catch (error) {
      console.error("Error calling Kalshi API:", error);
      setResult({
        success: false,
        error: "Failed to fetch Kalshi data",
      });
    }
  };

  const onAddToOverlay = async () => {
    if (!result || !result.success || !brand?.data?.id || !admin?.address)
      return;

    try {
      // Store the market in the database
      const storeResponse = await kalshiStoreMutation.mutateAsync({
        brandId: brand.data.id,
        kalshiData: result.data,
        kalshiUrl: url,
      });

      // Start the Kalshi market in the overlay via socket
      if (result.data.markets.length === 1) {
        // Single binary market
        const market = result.data.markets[0];
        console.log("market", market);
        adminStartKalshiMarket({
          id: storeResponse.data.eventId,
          brandId: brand.data.id,
          position: PopupPositions.TOP_RIGHT,
          marketTitle: result.data.eventTitle,
          marketType: "binary",
          closeTime: market.closeTime.toString(),
          yesPrice: market.yesPrice,
          noPrice: market.noPrice,
          ticker: market.ticker,
        });
        console.log("adminStartKalshiMarket-binary");
      } else {
        // Multiple markets - aggregated
        const options = result.data.markets.map((market, index) => {
          // Extract candidate name from noSubTitle (similar to multi-market-card)
          const candidateName = market.noSubTitle || "Unknown";

          return {
            optionId: `${storeResponse.data.eventId}-${index}`,
            optionName: candidateName,
            price: market.yesPrice,
            ticker: market.ticker,
          };
        });
        adminStartKalshiMarket({
          id: storeResponse.data.eventId,
          brandId: brand.data.id,
          position: PopupPositions.TOP_RIGHT,
          marketTitle: result.data.eventTitle,
          marketType: "aggregated",
          closeTime: result.data.markets[0].closeTime.toString(),
          options,
        });
        console.log("adminStartKalshiMarket-aggregated");
      }

      setIsConfirmed(true);
      console.log("Market added to overlay successfully:", storeResponse);
    } catch (error) {
      console.error("Error adding market to overlay:", error);
      // You might want to show an error message to the user here
    }
  };

  const isConfirmDisabled =
    url.trim().length === 0 || kalshiGetMutation.isPending;
  const isAddingToOverlay = kalshiStoreMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-2xl">
        Connect a Kalshi market URL to enhance your livestream with real-time
        predictions.
      </h1>
      <div className="flex flex-col justify-start items-start w-full gap-4">
        <label className="text-sm opacity-70">Kalshi market URL</label>
        <input
          type="url"
          placeholder="https://kalshi.com/markets/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full max-w-xl px-4 py-2 rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
        />
        <CTSButton
          className="rounded-full w-fit"
          variant="default"
          disabled={isConfirmDisabled}
          onClick={onConfirm}>
          {kalshiGetMutation.isPending ? "Loading..." : "Confirm"}
        </CTSButton>
      </div>

      {/* Display API Response */}
      {result && !isConfirmed && (
        <KalshiConfirmation
          result={result}
          isAddingToOverlay={isAddingToOverlay}
          onAddToOverlay={onAddToOverlay}
          onCancel={() => {
            setResult(null);
            setIsConfirmed(false);
          }}
        />
      )}

      {/* Success Message */}
      {isConfirmed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-green-800">
              <h3 className="font-bold text-lg mb-2">
                ✅ Market Added Successfully!
              </h3>
              <p className="text-sm">
                The market is now visible in your streaming overlay. Your
                audience can see real-time predictions.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
