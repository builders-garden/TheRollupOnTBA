import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http } from "viem";
import { basePreconf } from "viem/chains";
import { createConfig } from "wagmi";

export const wagmiConfigMiniApp = createConfig({
  ssr: undefined,
  chains: [basePreconf],
  transports: {
    [basePreconf.id]: http(),
  },
  connectors: [miniAppConnector()],
});
