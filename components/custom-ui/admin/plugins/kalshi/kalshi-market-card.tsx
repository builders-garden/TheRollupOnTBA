import { motion } from "motion/react";
import { KalshiMarketDisplay } from "@/lib/types/kalshi.type";

interface KalshiMarketCardProps {
  market: KalshiMarketDisplay;
  eventTitle?: string; // Add optional event title
  kalshiUrl?: string; // Add optional Kalshi URL
}

export const KalshiMarketCard = ({
  market,
  eventTitle,
  kalshiUrl,
}: KalshiMarketCardProps) => {
  // Calculate percentages from prices
  const yesPercentage = Math.round(parseFloat(market.yesPrice) * 100);
  const noPercentage = 100 - yesPercentage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-md bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 leading-tight mb-2">
            {eventTitle || market.title}
          </h3>
          {kalshiUrl && (
            <div className="mb-3">
              <a
                href={kalshiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-700 underline hover:no-underline transition-colors duration-200">
                View this market on Kalshi
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
              {market.status}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {market.ticker}
            </span>
          </div>
        </div>
      </div>

      {/* Yes/No Options */}
      <div className="grid grid-cols-2 gap-3">
        {/* Yes Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white border-2 border-blue-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 transition-colors duration-200">
          <div className="text-blue-600 font-bold text-lg mb-1">Yes</div>
          <div className="text-2xl font-bold text-blue-700">
            {yesPercentage}%
          </div>
        </motion.div>

        {/* No Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white border-2 border-purple-200 rounded-lg p-4 text-center cursor-pointer hover:border-purple-300 transition-colors duration-200">
          <div className="text-purple-600 font-bold text-lg mb-1">No</div>
          <div className="text-2xl font-bold text-purple-700">
            {noPercentage}%
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-green-200">
        <div className="flex justify-between items-center">
          <div className="text-right">
            <div className="text-xs">
              <span className="text-gray-500">powered by </span>
              <span className="text-green-600 font-bold">Kalshi</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
