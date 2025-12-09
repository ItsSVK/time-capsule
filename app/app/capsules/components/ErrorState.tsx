import { XCircle } from 'lucide-react';
import BackgroundGradients from '../../create/components/BackgroundGradients';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative">
      <BackgroundGradients />
      <div className="relative z-10">
        <Card className="border-2 border-destructive/30 shadow-2xl backdrop-blur-xl bg-card/95 max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="w-20 h-20 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Capsules</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

