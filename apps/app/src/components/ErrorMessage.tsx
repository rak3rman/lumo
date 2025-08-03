import { Button } from "@app/components/ui/button";
import Link from "next/link";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8 relative flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-gray-700 hover:bg-gray-800 text-white"
            >
              Try Again
            </Button>
          )}
          <Button
            variant="outline"
            asChild
            className="border-gray-300 text-gray-700"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
