'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cardVariants } from '../[address]/constants';

export default function CapsuleCardSkeleton() {
  return (
    <Card className="border-2 border-border/50 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden h-full">
      <div className="relative">
        {/* Image skeleton */}
        <div className="h-48 bg-muted/30 animate-pulse" />

        {/* Status badge skeleton */}
        <div className="absolute top-4 right-4 z-10">
          <div className="h-6 w-20 bg-muted/40 rounded-full animate-pulse" />
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Title skeleton */}
          <div className="min-h-[80px] space-y-2">
            <div className="h-6 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted/20 rounded animate-pulse w-1/2" />
          </div>

          {/* Time info skeleton */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="h-4 bg-muted/30 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-muted/20 rounded animate-pulse w-1/2" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50 min-h-[100px]">
            <div className="h-12 bg-muted/30 rounded animate-pulse" />
            <div className="h-12 bg-muted/30 rounded animate-pulse" />
            <div className="h-12 bg-muted/30 rounded animate-pulse col-span-2" />
          </div>

          {/* Button skeleton */}
          <div className="pt-2">
            <div className="h-10 bg-muted/30 rounded animate-pulse" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
