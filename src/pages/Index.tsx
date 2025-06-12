
import { CaptchaValidator } from '@/components/CaptchaValidator';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings } from 'lucide-react';

/**
 * Main application page demonstrating the CAPTCHA validator
 * Includes configuration options and completion handling
 */
const Index = () => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [enableColorTint, setEnableColorTint] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [completionResult, setCompletionResult] = useState<{
    success: boolean;
    attempts: number;
  } | null>(null);

  /**
   * Handles CAPTCHA completion - both success and failure cases
   */
  const handleCaptchaComplete = (success: boolean, attempts: number) => {
    console.log('CAPTCHA completed:', { success, attempts });
    setCompletionResult({ success, attempts });
    
    // In a real application, you would handle the result here
    // For example, proceed with user registration, login, etc.
  };

  /**
   * Resets the demo to initial state
   */
  const resetDemo = () => {
    setShowCaptcha(false);
    setCompletionResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Advanced CAPTCHA System
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A sophisticated multi-step verification system designed to distinguish humans from automated bots
            using camera capture and shape recognition.
          </p>
        </div>

        {!showCaptcha && !completionResult && (
          <div className="space-y-6">
            {/* Configuration Panel */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-semibold">Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enableColorTint}
                      onChange={(e) => setEnableColorTint(e.target.checked)}
                      className="rounded"
                    />
                    <span>Enable color tint validation</span>
                    <Badge variant="secondary">Task 2</Badge>
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adds color-based validation in addition to shape recognition
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maximum Attempts
                  </label>
                  <select
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value={1}>1 attempt</option>
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={5}>5 attempts</option>
                  </select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Number of failed attempts before blocking user
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowCaptcha(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                Start CAPTCHA Verification
              </Button>
            </Card>

            {/* Features Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Moving Target</h4>
                  <p className="text-sm text-muted-foreground">
                    Square overlay changes position randomly to prevent automated detection
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Shape Recognition</h4>
                  <p className="text-sm text-muted-foreground">
                    Users must identify specific shapes in a grid overlay
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Attempt Limiting</h4>
                  <p className="text-sm text-muted-foreground">
                    Progressive difficulty increase with each failed attempt
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {showCaptcha && !completionResult && (
          <CaptchaValidator
            onComplete={handleCaptchaComplete}
            enableColorTint={enableColorTint}
            maxAttempts={maxAttempts}
          />
        )}

        {completionResult && (
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">
              CAPTCHA {completionResult.success ? 'Completed' : 'Failed'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Result: {completionResult.success ? 'Success' : 'Failure'} after {completionResult.attempts} attempt(s)
            </p>
            <Button onClick={resetDemo} className="mr-2">
              Try Again
            </Button>
            {completionResult.success && (
              <Badge className="bg-green-100 text-green-800">
                Verification Complete
              </Badge>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
