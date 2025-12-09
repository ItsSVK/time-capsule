'use client';

import Link from 'next/link';
import { Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Built on Solana
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-rose-500" />
            <span>Crafted with care by</span>
            <span className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
              <Link href="https://x.com/ShouvikMohanta" target="_blank">
                SVK
              </Link>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/capsules"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Capsules
            </Link>
            <Link
              href="/create"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Create
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
