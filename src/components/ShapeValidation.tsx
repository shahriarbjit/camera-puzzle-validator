
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CapturedData, ValidationChallenge } from './CaptchaValidator';

interface ShapeValidationProps {
  capturedData: CapturedData;
  challenge: ValidationChallenge;
  onValidate: (selectedSectors: number[]) => void;
  toleranceLevel: number;
}

interface WatermarkData {
  sector: number;
  shape: 'triangle' | 'square' | 'circle';
  color: 'red' | 'green' | 'blue';
  hasWatermark: boolean;
}

/**
 * Shape validation component that displays the captured image with a grid overlay
 * Users must identify sectors containing specific shape watermarks
 */
export const ShapeValidation: React.FC<ShapeValidationProps> = ({
  capturedData,
  challenge,
  onValidate,
  toleranceLevel
}) => {
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);

  /**
   * Generates watermark data for all 16 sectors
   * Some sectors will have watermarks, others won't
   */
  const watermarkData = useMemo((): WatermarkData[] => {
    const data: WatermarkData[] = [];
    const shapes: Array<'triangle' | 'square' | 'circle'> = ['triangle', 'square', 'circle'];
    const colors: Array<'red' | 'green' | 'blue'> = ['red', 'green', 'blue'];
    
    // Generate watermark data for all 16 sectors
    for (let i = 0; i < 16; i++) {
      const hasWatermark = challenge.correctSectors.includes(i) || Math.random() < 0.3;
      
      data.push({
        sector: i,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        hasWatermark
      });
    }
    
    // Ensure all correct sectors have the required shape and color
    challenge.correctSectors.forEach(sectorIndex => {
      data[sectorIndex] = {
        sector: sectorIndex,
        shape: challenge.shape,
        color: challenge.color || 'red',
        hasWatermark: true
      };
    });
    
    console.log('Generated watermark data:', data);
    return data;
  }, [challenge]);

  /**
   * Handles sector selection/deselection
   */
  const handleSectorClick = useCallback((sectorIndex: number) => {
    setSelectedSectors(prev => {
      if (prev.includes(sectorIndex)) {
        return prev.filter(index => index !== sectorIndex);
      } else {
        return [...prev, sectorIndex];
      }
    });
  }, []);

  /**
   * Renders a watermark shape with appropriate styling
   */
  const renderWatermark = useCallback((watermark: WatermarkData) => {
    if (!watermark.hasWatermark) return null;
    
    const colorClass = challenge.color ? {
      red: 'text-red-500',
      green: 'text-green-500',
      blue: 'text-blue-500'
    }[watermark.color] : 'text-gray-600';
    
    const shapeElement = {
      triangle: (
        <div className={`w-6 h-6 ${colorClass}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21z" />
          </svg>
        </div>
      ),
      square: (
        <div className={`w-6 h-6 ${colorClass}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v18H3V3z" />
          </svg>
        </div>
      ),
      circle: (
        <div className={`w-6 h-6 ${colorClass}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      )
    };
    
    return shapeElement[watermark.shape];
  }, [challenge.color]);

  /**
   * Handles the validation submission
   */
  const handleValidate = useCallback(() => {
    console.log('Submitting validation with selected sectors:', selectedSectors);
    onValidate(selectedSectors);
  }, [selectedSectors, onValidate]);

  // Calculate grid dimensions based on the square position
  const { squarePosition } = capturedData;
  const sectorSize = squarePosition.size / 4;

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4">Select {challenge.shape}s</h3>
      
      {/* Challenge description */}
      <div className="mb-4">
        <p className="text-muted-foreground mb-2">
          Select all sectors that contain {challenge.color ? `${challenge.color} ` : ''}{challenge.shape}s
        </p>
        <Badge variant="outline" className="mb-4">
          Target: {challenge.color ? `${challenge.color} ` : ''}{challenge.shape}
        </Badge>
      </div>
      
      {/* Image with grid overlay */}
      <div className="relative inline-block mb-6 border-2 border-border rounded-lg overflow-hidden">
        <img
          src={capturedData.imageData}
          alt="Captured selfie"
          className="block max-w-full"
          style={{ maxWidth: '640px', height: 'auto' }}
        />
        
        {/* Grid overlay */}
        <div
          className="absolute border-2 border-yellow-400"
          style={{
            left: squarePosition.x,
            top: squarePosition.y,
            width: squarePosition.size,
            height: squarePosition.size
          }}
        >
          {/* 4x4 grid of sectors */}
          {Array.from({ length: 16 }, (_, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const isSelected = selectedSectors.includes(index);
            const watermark = watermarkData[index];
            
            return (
              <button
                key={index}
                onClick={() => handleSectorClick(index)}
                className={`absolute border border-yellow-400/50 hover:bg-yellow-400/30 transition-colors ${
                  isSelected ? 'bg-blue-500/50' : 'bg-transparent'
                } flex items-center justify-center`}
                style={{
                  left: col * sectorSize,
                  top: row * sectorSize,
                  width: sectorSize,
                  height: sectorSize
                }}
              >
                {renderWatermark(watermark)}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Selection info */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Selected sectors: {selectedSectors.length}
        </p>
        {toleranceLevel < 3 && (
          <p className="text-sm text-orange-600 mt-1">
            ⚠️ Reduced tolerance: Be more precise with your selection
          </p>
        )}
      </div>
      
      <Button
        onClick={handleValidate}
        disabled={selectedSectors.length === 0}
        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 text-lg"
      >
        Validate
      </Button>
    </div>
  );
};
