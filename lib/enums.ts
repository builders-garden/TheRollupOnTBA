// Chain Images
export enum ChainImages {
  ETHEREUM = "/chains/ethereum-logo.svg",
  OPTIMISM = "/chains/optimism-logo.svg",
  POLYGON = "/chains/polygon-logo.svg",
  BASE = "/chains/base-logo.svg",
  ARBITRUM = "/chains/arbitrum-logo.svg",
  AVALANCHE = "/chains/avalanche-logo.svg",
  BNB = "/chains/bnb-logo.svg",
}

// Admin Page Content
export enum AdminPageContent {
  BRAND = "brand",
  PLUGINS = "plugins",
  OVERLAY = "overlay",
}

// Plugins Tabs
export enum PluginsTabs {
  TIPS = "tips",
  TOKENS = "tokens",
  SENTIMENT = "sentiment",
}

// Overlay Tabs
export enum OverlayTabs {
  POPUPS = "popups",
  SENTIMENT_RESULTS = "sentiment_results",
}

// Popup Positions
export enum PopupPositions {
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
  TOP_CENTER = "top-center",
  BOTTOM_CENTER = "bottom-center",
}

// client to server
export enum ClientToServerSocketEvents {
  TIP_SENT = "tip_sent",
  TOKEN_TRADED = "token_traded",
  VOTE_CASTED = "vote_casted",
  JOIN_STREAM = "stream_joined",
  START_SENTIMENT_POLL = "start_sentiment_poll",
  END_SENTIMENT_POLL = "end_sentiment_poll",
  UPDATE_SENTIMENT_POLL = "update_sentiment_poll",
}

// server to client
export enum ServerToClientSocketEvents {
  TIP_RECEIVED = "tip_received",
  VOTE_RECEIVED = "vote_received",
  TOKEN_TRADED = "token_traded",
  STREAM_JOINED = "stream_joined",
  START_SENTIMENT_POLL = "start_sentiment_poll",
  END_SENTIMENT_POLL = "end_sentiment_poll",
  UPDATE_SENTIMENT_POLL = "update_sentiment_poll",
  ERROR = "error",
}
