import { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { appQueryClient, wagmiConfig } from "@/lib/wagmi";
import { base } from "viem/chains";

interface AppProvidersProps {
  children: ReactNode;
}

const onchainKitApiKey = import.meta.env.VITE_ONCHAINKIT_API_KEY;
const providerProps = {
  config: {
    ...wagmiConfig,
    appearance: {
      name: '8192 Mini App',
      logo: 'https://your-logo.com',
      mode: 'dark',
      theme: 'default',
    },
    wallet: {
      display: 'modal',
      termsUrl: 'https://...',
      privacyUrl: 'https://...',
    },
  },
  queryClient: appQueryClient,
  miniKit: { enabled: true },
} as const;

export const AppProviders = ({ children }: AppProvidersProps) => (
  <OnchainKitProvider
    chain={base}
    {...providerProps}
    {...(onchainKitApiKey ? { apiKey: onchainKitApiKey } : {})}
  >
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={appQueryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  </OnchainKitProvider>
);
