import { getDefaultConfig } from "@daimo/pay";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  basePreconf as basePreconfReown,
  baseSepoliaPreconf as baseSepoliaPreconfReown,
  mainnet as mainnetReown,
  type AppKitNetwork,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { http } from "viem";
import { basePreconf, baseSepoliaPreconf, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import { env } from "@/lib/zod";

// 1. Get projectId from https://cloud.reown.com
const projectId = env.NEXT_PUBLIC_REOWN_PROJECT_ID;

// 2. Create a metadata object - optional
const metadata = {
  name: "Farcaster Starter",
  description: "Farcaster Starter by Builders Garden",
  url: env.NEXT_PUBLIC_URL,
  icons: [`${env.NEXT_PUBLIC_URL}/images/icon.png`],
};

// 3. Create DaimoPay-compatible wagmi config with all required chains
export const wagmiConfigMiniApp = createConfig(
  getDefaultConfig({
    appName: "Farcaster Starter",
    appDescription: "Farcaster Starter by Builders Garden",
    appUrl: env.NEXT_PUBLIC_URL,
    appIcon: `${env.NEXT_PUBLIC_URL}/images/icon.png`,
    ssr: true,
    chains: [mainnet, basePreconf, baseSepoliaPreconf],
    transports: {
      [mainnet.id]: http(),
      [basePreconf.id]: http(),
      [baseSepoliaPreconf.id]: http(),
    },
    additionalConnectors: [miniAppConnector()],
  }),
);

// MiniApp wagmi config
export const wagmiConfigReown = createConfig(
  getDefaultConfig({
    appName: "Farcaster Starter",
    appDescription: "Farcaster Starter by Builders Garden",
    appUrl: env.NEXT_PUBLIC_URL,
    appIcon: `${env.NEXT_PUBLIC_URL}/images/icon.png`,
    ssr: undefined, // important for reown to work on nextjs
    chains: [mainnetReown, basePreconfReown, baseSepoliaPreconfReown],
    transports: {
      [mainnetReown.id]: http(),
      [basePreconfReown.id]: http(),
      [baseSepoliaPreconfReown.id]: http(),
    },
  }),
);

// 4. Set the networks for AppKit (keeping base and baseSepolia for primary functionality)
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnetReown,
  basePreconfReown,
  baseSepoliaPreconfReown,
];

// 5. Create Wagmi Adapter (keeping original for AppKit compatibility, but we'll use wagmiDaimoConfig in the app)
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: undefined, // important for reown to work on nextjs
  transports: {
    [mainnetReown.id]: http(),
    [basePreconfReown.id]: http(),
    [baseSepoliaPreconfReown.id]: http(),
  },
});

// 6. Create modal (AppKit modal, but we use wagmiConfig directly in the app for DaimoPay compatibility)
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});
