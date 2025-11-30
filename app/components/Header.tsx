"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Plus, Timer } from "lucide-react";
import { useMounted } from "@/lib/solana/provider";

export function Header() {
  const { publicKey } = useWallet();
  const mounted = useMounted();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              TimeCapsule
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Explore
            </Link>
            <Link 
              href="/create" 
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Create
            </Link>
            {mounted && publicKey && (
              <Link 
                href="/profile" 
                className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {mounted && publicKey && (
              <Link
                href="/create"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                New Capsule
              </Link>
            )}
            
            {/* Wallet Button - Only render after mount to prevent hydration mismatch */}
            {mounted ? (
              <WalletMultiButton className="!bg-zinc-800 !hover:bg-zinc-700 !rounded-xl !h-10 !text-sm" />
            ) : (
              <div className="h-10 w-[166px] bg-zinc-800 rounded-xl animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

