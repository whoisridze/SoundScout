import { memo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({
  message = "Failed to load data",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-error-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-error-500" />
      </div>
      <p className="text-text-secondary mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

export default memo(ErrorState);
