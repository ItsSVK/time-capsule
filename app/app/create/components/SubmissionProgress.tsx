import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/kibo-ui/spinner';
import { CheckCircle } from 'lucide-react';

interface SubmissionProgressProps {
  progress: number;
  message: string;
}

export function SubmissionProgress({ progress, message }: SubmissionProgressProps) {
  return (
    <>
      <div className="text-sm text-muted-foreground mx-2 flex justify-between">
        <div className="flex items-center gap-2">
          {progress < 100 ? (
            <Spinner variant="throbber" className="size-4" />
          ) : (
            <CheckCircle className="size-4 text-green-500 animate-pulse" />
          )}
          {message}
        </div>
        <div className="text-sm text-muted-foreground">{progress}%</div>
      </div>
      <Progress value={progress} className="w-full mt-1" />
    </>
  );
}

