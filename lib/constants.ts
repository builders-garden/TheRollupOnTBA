export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};
export const FARCASTER_EMBED_SIZE = {
  width: 1500,
  height: 1000,
};

export const ADMIN_FIDS = [
  4461, // limone.eth
  5698, // 0xcaso.eth
  262800, // midena.eth
  189636, // bianc8.eth
  16286, // frankk
  215293, // blackicon.eth
  592677, // builders-garden
];

export const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// TODO update this address
export const DESTINATION_ADDRESS = "0x0000000000000000000000000000000000000000";
// Temporary bullmeter address on Base
export const BULLMETER_ADDRESS = "0x1E9f6659B8Df87296D7DFf6b01ca08aB14CaA3d9";

// List of Base App trade supported chains (name, symbol, chainId, logoUrl)
export const BASE_APP_SUPPORTED_CHAINS = [
  {
    name: "Base",
    symbol: "BASE",
    chainId: "8453",
    logoUrl: "/chains/base-logo.svg",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    chainId: "1",
    logoUrl: "/chains/ethereum-logo.svg",
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    chainId: "137",
    logoUrl: "/chains/polygon-logo.svg",
  },
  {
    name: "Optimism",
    symbol: "OP",
    chainId: "10",
    logoUrl: "/chains/optimism-logo.svg",
  },
  {
    name: "Arbitrum",
    symbol: "ARB",
    chainId: "42161",
    logoUrl: "/chains/arbitrum-logo.svg",
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    chainId: "43114",
    logoUrl: "/chains/avalanche-logo.svg",
  },
  {
    name: "BNB Chain",
    symbol: "BNB",
    chainId: "56",
    logoUrl: "/chains/bnb-logo.svg",
  },
];
