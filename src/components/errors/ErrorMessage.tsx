import { AlertTriangle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: "default" | "destructive";
}

export function ErrorMessage({
  title = "Error",
  message,
  variant = "destructive",
}: ErrorMessageProps) {
  return (
    <Alert variant={variant}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this page. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <XCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
