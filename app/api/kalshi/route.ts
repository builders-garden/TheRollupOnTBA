import { NextRequest, NextResponse } from "next/server";
import {
  KalshiApiError,
  KalshiApiResponse,
  KalshiApiSuccess,
} from "@/lib/types/kalshi.type";

// Temporary mock data - remove when ready for real API
const MOCK_DATA = {
  event: {
    available_on_brokers: true,
    category: "Economics",
    collateral_return_type: "MECNET",
    event_ticker: "KXFEDDECISION-25OCT",
    mutually_exclusive: true,
    series_ticker: "KXFEDDECISION",
    strike_date: "2025-10-29T18:00:00Z",
    strike_period: "",
    sub_title: "On Oct 29, 2025",
    title: "Fed decision in Oct 2025?",
  },
  markets: [
    {
      can_close_early: true,
      category: "",
      close_time: "2025-10-29T17:59:00Z",
      custom_strike: { Cut: "25" },
      event_ticker: "KXFEDDECISION-25OCT",
      expected_expiration_time: "2025-10-29T18:05:00Z",
      expiration_time: "2026-01-28T18:01:00Z",
      expiration_value: "",
      last_price: 95,
      last_price_dollars: "0.9500",
      latest_expiration_time: "2026-01-28T18:01:00Z",
      liquidity: 664120352,
      liquidity_dollars: "6641203.5200",
      market_type: "binary",
      no_ask: 5,
      no_ask_dollars: "0.0500",
      no_bid: 4,
      no_bid_dollars: "0.0400",
      no_sub_title: "Cut 25bps",
      notional_value: 100,
      notional_value_dollars: "1.0000",
      open_interest: 3423489,
      open_time: "2025-08-05T14:00:00Z",
      previous_price: 0,
      previous_price_dollars: "0.0000",
      previous_yes_ask: 0,
      previous_yes_ask_dollars: "0.0000",
      previous_yes_bid: 0,
      previous_yes_bid_dollars: "0.0000",
      price_level_structure: "linear_cent",
      price_ranges: [{ end: "1.0000", start: "0.0000", step: "0.0100" }],
      response_price_units: "usd_cent",
      result: null,
      risk_limit_cents: 0,
      rules_primary:
        "If the Federal Reserve does a Cut of 25bps on October 29, 2025, then the market resolves to Yes.",
      rules_secondary:
        'This market is mutually exclusive. Therefore, if the Federal Reserve hikes by 50bps, the 50bps market will resolve to Yes and the 25bps market will resolve to No. Only one bucket, at maximum, can resolve to Yes. Note 4/28/25: For the markets beginning after the May meeting, if a scheduled FOMC meeting is canceled and does not occur on its scheduled date, then the strike for "Fed maintains rate" will resolve to Yes and all others will resolve to No.',
      settlement_timer_seconds: 297,
      status: "active",
      strike_type: "custom",
      subtitle: "Cut 25bps",
      tick_size: 1,
      ticker: "KXFEDDECISION-25OCT-C25",
      title:
        "Will the Federal Reserve Cut rates by 25bps at their October 2025 meeting?",
      volume: 4390833,
      volume_24h: 195724,
      yes_ask: 96,
      yes_ask_dollars: "0.9600",
      yes_bid: 95,
      yes_bid_dollars: "0.9500",
      yes_sub_title: "Cut 25bps",
    },
  ],
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      const errorResponse: KalshiApiError = {
        success: false,
        error: "URL is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TEMPORARY: Use mock data instead of real API call
    // TODO: Replace with real API call when ready
    console.log("Using mock data for Kalshi API - URL:", url);

    const data = MOCK_DATA as unknown as KalshiApiResponse;

    // Extract market data for display
    const marketData = data.markets.map((market) => ({
      title: market.title,
      yesPrice: market.yes_bid_dollars,
      noPrice: market.no_bid_dollars,
      status: market.status,
      ticker: market.ticker,
    }));

    const successResponse: KalshiApiSuccess = {
      success: true,
      data: {
        eventTitle: data.event.title,
        markets: marketData,
      },
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Kalshi API error:", error);
    const errorResponse: KalshiApiError = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};
