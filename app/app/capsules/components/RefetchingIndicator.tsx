interface RefetchingIndicatorProps {
  isRefetching: boolean;
}

export default function RefetchingIndicator({
  isRefetching,
}: RefetchingIndicatorProps) {
  if (!isRefetching) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Updating...</span>
      </div>
    </div>
  );
}

