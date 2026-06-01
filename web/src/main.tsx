import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const fhenixHelium = {
  id: 42069,
  name: "Fhenix Helium",
  network: "fhenix-helium",
  nativeCurrency: {
    decimals: 18,
    name: "tFHE",
    symbol: "tFHE",
  },
  rpcUrls: {
    public: { http: ["https://api.helium.fhenix.zone"] },
    default: { http: ["https://api.helium.fhenix.zone"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.helium.fhenix.zone" },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: "TrialVault",
  projectId: "YOUR_PROJECT_ID", // standard wagmi placeholder
  chains: [fhenixHelium, mainnet, polygon, optimism, arbitrum, base],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#4f46e5', // TrialVault primary brand color
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
