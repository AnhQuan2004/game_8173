import { http, createConfig } from "wagmi";
import { base } from "viem/chains";
import { QueryClient } from "@tanstack/react-query";
import { coinbaseWallet } from "wagmi/connectors";

export const appQueryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    coinbaseWallet({
      appName: "8192 Mini App",
    }),
  ],
  ssr: false,
});
