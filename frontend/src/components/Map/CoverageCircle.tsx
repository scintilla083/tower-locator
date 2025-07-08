// frontend/src/components/Map/CoverageCircle.tsx
import React from 'react';
import { Circle } from 'react-leaflet';

interface CoverageCircleProps {
  center: [number, number];
  radiusKm: number;
  isUserInCoverage?: boolean;
  opacity?: number;
}

const CoverageCircle: React.FC<CoverageCircleProps> = ({
  center,
  radiusKm,
  isUserInCoverage = false,
  opacity = 0.3
}) => {
  // Safe radius calculation with fallback
  const safeRadiusKm = radiusKm && radiusKm > 0 ? radiusKm : 5.0;
  const radiusInMeters = safeRadiusKm * 1000;

  // Safe center coordinates with fallbacks
  const safeCenter: [number, number] = [
    center[0] && !isNaN(center[0]) ? center[0] : 50.4501,
    center[1] && !isNaN(center[1]) ? center[1] : 30.5234
  ];

  return (
    <Circle
      center={safeCenter}
      radius={radiusInMeters}
      pathOptions={{
        color: isUserInCoverage ? '#22c55e' : '#eab308', // Green if user in coverage, yellow otherwise
        fillColor: isUserInCoverage ? '#22c55e' : '#eab308',
        fillOpacity: isUserInCoverage ? 0.4 : opacity,
        weight: 2,
        opacity: isUserInCoverage ? 0.8 : 0.6,
      }}
    />
  );
};

export default CoverageCircle;