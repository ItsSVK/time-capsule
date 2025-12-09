'use client';

import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cardVariants } from '../constants';
import type { ParsedCapsule } from '@/lib/solana/types';

interface ScheduleCardProps {
  capsule: ParsedCapsule;
}

export default function ScheduleCard({ capsule }: ScheduleCardProps) {
  const openTimestamp = capsule.account.openTimestamp.toNumber();

  return (
    <Card className="border-2 border-border/50 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/5" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Unlock Date</p>
          <p className="font-semibold">
            {new Date(openTimestamp * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Unlock Time</p>
          <p className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {new Date(openTimestamp * 1000).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
