import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { http } from "viem";
import { basePreconf } from "viem/chains";
import { cookieStorage, createConfig, createStorage } from "wagmi";
import { env } from "./zod";

export const wagmiConfigMiniApp = createConfig({
  ssr: undefined,
  chains: [basePreconf],
  transports: {
    [basePreconf.id]: http(),
  },
  connectors: [miniAppConnector()],
});

export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [basePreconf],
});

export const wagmiConfigWebApp = wagmiAdapter.wagmiConfig;
