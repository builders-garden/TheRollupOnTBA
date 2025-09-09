import { getDefaultConfig } from "@daimo/pay";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http } from "viem";
import { basePreconf } from "viem/chains";
import { createConfig } from "wagmi";
import { env } from "@/lib/zod";

export const wagmiConfigMiniApp = createConfig(
  getDefaultConfig({
    appName: "Farcaster Starter",
    appDescription: "Farcaster Starter by Builders Garden",
    appUrl: env.NEXT_PUBLIC_URL,
    appIcon: `${env.NEXT_PUBLIC_URL}/images/icon.png`,
    ssr: true,
    chains: [basePreconf],
    transports: {
      [basePreconf.id]: http(),
    },
    additionalConnectors: [miniAppConnector()],
  }),
);

