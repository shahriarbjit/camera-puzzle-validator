
import React, { useState, useCallback } from 'react';
import { CameraCapture } from './CameraCapture';
import { ShapeValidation } from './ShapeValidation';
import { ValidationResult } from './ValidationResult';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type CaptchaStep = 'camera' | 'validation' | 'result';
export type ValidationShape = 'triangle' | 'square' | 'circle';
export type ValidationColor = 'red' | 'green' | 'blue';

export interface CapturedData {
  imageData: string;
  squarePosition: { x: number; y: number; size: number };
}

export interface ValidationChallenge {
  shape: ValidationShape;
  color?: ValidationColor;
  correctSectors: number[];
}

interface CaptchaValidatorProps {
  onComplete?: (success: boolean, attempts: number) => void;
  enableColorTint?: boolean;
  maxAttempts?: number;
}

/**
 * Main CAPTCHA validation component that orchestrates the entire validation flow
 * Implements a multi-step verification process with camera capture and shape recognition
 */
export const CaptchaValidator: React.FC<CaptchaValidatorProps> = ({
  onComplete,
  enableColorTint = false,
  maxAttempts = 3
}) => {
  // Current step in the validation process
  const [currentStep, setCurrentStep] = useState<CaptchaStep>('camera');
  
  // Data captured from the camera step
  const [capturedData, setCapturedData] = useState<CapturedData | null>(null);
  
  // Current validation challenge configuration
  const [challenge, setChallenge] = useState<ValidationChallenge | null>(null);
  
  // Validation result and attempt tracking
  const [validationSuccess, setValidationSuccess] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  /**
   * Handles the camera capture completion
   * Generates a new validation challenge and proceeds to validation step
   */
  const handleCameraCapture = useCallback((data: CapturedData) => {
    console.log('Camera capture completed:', data);
    setCapturedData(data);
    
    // Generate validation challenge with randomized parameters
    const shapes: ValidationShape[] = ['triangle', 'square', 'circle'];
    const colors: ValidationColor[] = ['red', 'green', 'blue'];
    
    const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
    const selectedColor = enableColorTint ? colors[Math.floor(Math.random() * colors.length)] : undefined;
    
    // Generate random correct sectors (we'll have 16 sectors in a 4x4 grid)
    const numCorrectSectors = Math.floor(Math.random() * 4) + 2; // 2-5 correct sectors
    const correctSectors: number[] = [];
    
    while (correctSectors.length < numCorrectSectors) {
      const sector = Math.floor(Math.random() * 16);
      if (!correctSectors.includes(sector)) {
        correctSectors.push(sector);
      }
    }
    
    const newChallenge: ValidationChallenge = {
      shape: selectedShape,
      color: selectedColor,
      correctSectors: correctSectors.sort()
    };
    
    console.log('Generated challenge:', newChallenge);
    setChallenge(newChallenge);
    setCurrentStep('validation');
  }, [enableColorTint]);

  /**
   * Handles the shape validation completion
   * Checks user's selection against the correct answer
   */
  const handleValidationComplete = useCallback((selectedSectors: number[]) => {
    if (!challenge) return;
    
    console.log('Validation attempt:', { selected: selectedSectors, correct: challenge.correctSectors });
    
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    
    // Check if user selected the correct sectors
    const isCorrect = 
      selectedSectors.length === challenge.correctSectors.length &&
      selectedSectors.every(sector => challenge.correctSectors.includes(sector)) &&
      challenge.correctSectors.every(sector => selectedSectors.includes(sector));
    
    console.log('Validation result:', isCorrect);
    setValidationSuccess(isCorrect);
    
    if (isCorrect) {
      // Success - complete the CAPTCHA
      setCurrentStep('result');
      onComplete?.(true, newAttemptCount);
    } else if (newAttemptCount >= maxAttempts) {
      // Too many failed attempts - block the user
      setIsBlocked(true);
      setCurrentStep('result');
      onComplete?.(false, newAttemptCount);
    } else {
      // Failed attempt but can retry - show result then allow restart
      setCurrentStep('result');
    }
  }, [challenge, attemptCount, maxAttempts, onComplete]);

  /**
   * Resets the CAPTCHA to start over
   * Used when user fails but hasn't exceeded maximum attempts
   */
  const handleRetry = useCallback(() => {
    console.log('Retrying CAPTCHA validation');
    setCurrentStep('camera');
    setCapturedData(null);
    setChallenge(null);
    setValidationSuccess(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Security Verification</h2>
          <p className="text-muted-foreground">
            Complete the following steps to verify you're human
          </p>
          {attemptCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Attempt {attemptCount} of {maxAttempts}
            </p>
          )}
        </div>

        {currentStep === 'camera' && (
          <CameraCapture onCapture={handleCameraCapture} />
        )}

        {currentStep === 'validation' && capturedData && challenge && (
          <ShapeValidation
            capturedData={capturedData}
            challenge={challenge}
            onValidate={handleValidationComplete}
            toleranceLevel={Math.max(1, maxAttempts - attemptCount)} // Decrease tolerance with attempts
          />
        )}

        {currentStep === 'result' && (
          <ValidationResult
            success={validationSuccess}
            isBlocked={isBlocked}
            attemptCount={attemptCount}
            maxAttempts={maxAttempts}
            onRetry={handleRetry}
            canRetry={!isBlocked && !validationSuccess && attemptCount < maxAttempts}
          />
        )}
      </Card>
    </div>
  );
};
