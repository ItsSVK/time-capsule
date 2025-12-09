'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { LogOut, Wallet } from 'lucide-react';

export default function CustomConnectButton() {
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleConnect = () => {
    setVisible(true);
  };

  if (connecting) {
    return (
      <Button variant="default" size="default" disabled>
        Connecting...
      </Button>
    );
  }

  if (!connected) {
    return (
      <Button
        variant="default"
        size="default"
        className="gap-2 cursor-pointer"
        onClick={handleConnect}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="default"
      className="gap-3 cursor-pointer"
      onClick={disconnect}
    >
      {publicKey?.toBase58()?.slice(0, 4)}...{publicKey?.toBase58()?.slice(-4)}
      {' | '}
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
