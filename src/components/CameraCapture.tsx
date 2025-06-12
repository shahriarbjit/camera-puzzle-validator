
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CapturedData } from './CaptchaValidator';

interface CameraCaptureProps {
  onCapture: (data: CapturedData) => void;
}

interface SquarePosition {
  x: number;
  y: number;
  size: number;
}

/**
 * Camera capture component that shows live video feed with a moving square overlay
 * The square position changes randomly to prevent automated detection
 */
export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [squarePosition, setSquarePosition] = useState<SquarePosition>({
    x: 150,
    y: 150,
    size: 100
  });
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });

  /**
   * Initializes the camera stream and starts the square animation
   */
  const initializeCamera = useCallback(async () => {
    try {
      console.log('Initializing camera...');
      
      // Request camera access with specific constraints for better security
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 },
          facingMode: 'user' // Front-facing camera for selfies
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          const video = videoRef.current!;
          setVideoSize({
            width: video.videoWidth || 640,
            height: video.videoHeight || 480
          });
          setIsLoading(false);
          startSquareAnimation();
        };
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      setIsLoading(false);
    }
  }, []);

  /**
   * Starts the animated square overlay that moves randomly
   * This prevents bots from predicting the square position
   */
  const startSquareAnimation = useCallback(() => {
    let lastMoveTime = 0;
    const moveInterval = 2000 + Math.random() * 3000; // Random interval between 2-5 seconds
    
    const animate = (currentTime: number) => {
      if (currentTime - lastMoveTime > moveInterval) {
        // Generate new random position within video bounds
        const margin = 50;
        const maxX = Math.max(margin, videoSize.width - squarePosition.size - margin);
        const maxY = Math.max(margin, videoSize.height - squarePosition.size - margin);
        
        const newPosition: SquarePosition = {
          x: Math.random() * maxX,
          y: Math.random() * maxY,
          size: 80 + Math.random() * 40 // Random size between 80-120px
        };
        
        console.log('Square moved to:', newPosition);
        setSquarePosition(newPosition);
        lastMoveTime = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [videoSize, squarePosition.size]);

  /**
   * Captures the current frame and square position
   * This data will be used in the next validation step
   */
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    console.log('Capturing frame with square at:', squarePosition);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth || videoSize.width;
    canvas.height = video.videoHeight || videoSize.height;
    
    // Draw the current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Calculate square position relative to actual video dimensions
    const scaleX = canvas.width / videoSize.width;
    const scaleY = canvas.height / videoSize.height;
    
    const capturedData: CapturedData = {
      imageData,
      squarePosition: {
        x: squarePosition.x * scaleX,
        y: squarePosition.y * scaleY,
        size: squarePosition.size * Math.min(scaleX, scaleY)
      }
    };
    
    // Stop animation and camera stream
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    onCapture(capturedData);
  }, [squarePosition, videoSize, onCapture]);

  /**
   * Cleanup function to stop camera stream and animations
   */
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  useEffect(() => {
    initializeCamera();
    return cleanup;
  }, [initializeCamera, cleanup]);

  if (error) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4">Take Selfie</h3>
      
      <div className="relative inline-block mb-6 border-2 border-border rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block"
          style={{ width: videoSize.width, height: videoSize.height }}
        />
        
        {/* Moving square overlay */}
        <div
          className="absolute border-2 border-yellow-400 bg-yellow-400/20 transition-all duration-1000 ease-in-out"
          style={{
            left: squarePosition.x,
            top: squarePosition.y,
            width: squarePosition.size,
            height: squarePosition.size,
            boxShadow: '0 0 10px rgba(255, 193, 7, 0.6)'
          }}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Initializing camera...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      <Button
        onClick={handleCapture}
        disabled={isLoading}
        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 text-lg"
      >
        Continue
      </Button>
    </div>
  );
};
