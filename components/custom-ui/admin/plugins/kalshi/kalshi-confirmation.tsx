import { motion } from "motion/react";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { KalshiApiResult } from "@/lib/types/kalshi.type";
import { KalshiMarketCard } from "./kalshi-market-card";
import { KalshiMultiMarketCard } from "./kalshi-multi-market-card";

interface KalshiConfirmationProps {
  result: KalshiApiResult;
  isAddingToOverlay: boolean;
  onAddToOverlay: () => void;
  onCancel: () => void;
}

export const KalshiConfirmation = ({
  result,
  isAddingToOverlay,
  onAddToOverlay,
  onCancel,
}: KalshiConfirmationProps) => {
  if (!result.success) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      {/* Market Preview Section */}
      <div className="mb-6">
        <h2 className="font-semibold text-white text-2xl mb-4 text-center">
          Market Preview
        </h2>
        {/* Conditional rendering based on market count */}
        {result.data.markets.length === 1 ? (
          // Single market - use individual card
          <div className="flex justify-center">
            <KalshiMarketCard
              market={result.data.markets[0]}
              eventTitle={result.data.eventTitle}
              kalshiUrl={result.data.kalshiUrl}
            />
          </div>
        ) : (
          // Multiple markets - use multi-market card
          <div className="flex justify-center">
            <KalshiMultiMarketCard
              markets={result.data.markets}
              eventTitle={result.data.eventTitle}
              totalMarkets={result.data.totalMarkets}
              kalshiUrl={result.data.kalshiUrl}
            />
          </div>
        )}
      </div>

      {/* Confirmation Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-blue-800">
          <h3 className="font-bold text-lg mb-3">Ready to Add to Overlay?</h3>
          <p className="mb-4 text-sm">
            This market will be visible in the streaming overlay for your
            audience to see real-time predictions.
          </p>
          <div className="flex gap-3">
            <CTSButton
              className="rounded-full"
              variant="default"
              disabled={isAddingToOverlay}
              onClick={onAddToOverlay}>
              {isAddingToOverlay ? "Adding..." : "Add to Overlay"}
            </CTSButton>
            <CTSButton
              className="rounded-full"
              variant="outline"
              onClick={onCancel}>
              Cancel
            </CTSButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
