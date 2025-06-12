
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Ban, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ValidationResultProps {
  success: boolean;
  isBlocked: boolean;
  attemptCount: number;
  maxAttempts: number;
  onRetry: () => void;
  canRetry: boolean;
}

/**
 * Displays the validation result and provides retry options
 * Handles success, failure, and blocked states
 */
export const ValidationResult: React.FC<ValidationResultProps> = ({
  success,
  isBlocked,
  attemptCount,
  maxAttempts,
  onRetry,
  canRetry
}) => {
  if (success) {
    return (
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-700 mb-2">
          Verification Successful!
        </h3>
        <p className="text-muted-foreground mb-4">
          You have successfully completed the CAPTCHA verification.
        </p>
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            Welcome! You have been verified as a human user.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="text-center">
        <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-red-700 mb-2">
          Access Blocked
        </h3>
        <p className="text-muted-foreground mb-4">
          You have exceeded the maximum number of verification attempts.
        </p>
        <Alert className="bg-red-50 border-red-200">
          <Ban className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            Please try again later or contact support if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="text-center">
      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-red-700 mb-2">
        Verification Failed
      </h3>
      <p className="text-muted-foreground mb-4">
        The shapes you selected don't match the required pattern.
      </p>
      
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Attempts: {attemptCount} of {maxAttempts}
        </p>
        {canRetry && (
          <p className="text-sm text-orange-600 mt-1">
            You have {maxAttempts - attemptCount} attempt{maxAttempts - attemptCount !== 1 ? 's' : ''} remaining.
          </p>
        )}
      </div>

      {canRetry ? (
        <Button
          onClick={onRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      ) : (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            No more attempts remaining. Please refresh the page to start over.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
