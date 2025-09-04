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

// Admin Page Tab
export enum AdminPageTab {
  TIPS = "tips",
  TOKENS = "tokens",
  SENTIMENT = "sentiment",
}

// client to server
export enum ClientToServerSocketEvents {
  TIP_SENT = "tip_sent",
  TOKEN_TRADED = "token_traded",
  VOTE_CASTED = "vote_casted",
  JOIN_STREAM = "stream_joined",
}

// server to client
export enum ServerToClientSocketEvents {
  TIP_RECEIVED = "tip_received",
  VOTE_RECEIVED = "vote_received",
  TOKEN_TRADED = "token_traded",
  STREAM_JOINED = "stream_joined",
  ERROR = "error",
}
