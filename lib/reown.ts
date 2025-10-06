import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { http } from "viem";
import { base, basePreconf } from "viem/chains";
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

export const wagmiConfigWebApp = createConfig({
  ssr: undefined,
  chains: [basePreconf],
  transports: {
    [basePreconf.id]: http(),
  },
});

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: false,
  projectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [base],
});
