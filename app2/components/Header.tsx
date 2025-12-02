import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Timer, Wallet } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import CustomConnectButton from '@/components/CustomConnect';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Timer className="w-5 h-5 text-white dark:text-black" />
              {/* <span className="text-lg font-bold">TC</span> */}
            </div>
            <span className="text-lg font-semibold text-foreground">
              Time Capsule
            </span>
          </div>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <CustomConnectButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
