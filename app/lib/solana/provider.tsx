"use client";

import { FC, ReactNode, useMemo, useState, useEffect, createContext, useContext } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { RPC_ENDPOINT } from "./constants";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Context to track if component is mounted (client-side)
const MountedContext = createContext(false);
export const useMounted = () => useContext(MountedContext);

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  // Only render wallet UI after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <MountedContext.Provider value={mounted}>
      <ConnectionProvider endpoint={RPC_ENDPOINT}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </MountedContext.Provider>
  );
};

