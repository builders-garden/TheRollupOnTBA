import { motion } from "motion/react";
import { useState } from "react";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { KalshiApiResult } from "@/lib/types/kalshi.type";
import { KalshiMarketCard } from "./kalshi-market-card";

export const KalshiContent = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<KalshiApiResult | null>(null);

  const onConfirm = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/kalshi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data: KalshiApiResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error calling Kalshi API:", error);
      setResult({
        success: false,
        error: "Failed to fetch Kalshi data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmDisabled = url.trim().length === 0 || isLoading;

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
          {isLoading ? "Loading..." : "Confirm"}
        </CTSButton>
      </div>

      {/* Display API Response */}
      {result && (
        <div className="w-full mt-6">
          {result.success ? (
            <div>
              <div className="mb-6">
                <h3 className="font-bold text-2xl mb-2 text-gray-800">
                  {result.data.eventTitle}
                </h3>
                <p className="text-gray-600">
                  {result.data.markets.length} market
                  {result.data.markets.length !== 1 ? "s" : ""} available
                </p>
              </div>

              {/* Market Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.data.markets.map((market, index) => (
                  <KalshiMarketCard
                    key={`${market.ticker}-${index}`}
                    market={market}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600">
                <h3 className="font-bold text-lg mb-2">Error</h3>
                <p>{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
