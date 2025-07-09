// frontend/src/components/Map/AccurateCoverageCircle.tsx - Optimized version
import React from 'react';
import { Polygon } from 'react-leaflet';
import { generateCirclePoints } from '../../utils/calculations';

interface AccurateCoverageCircleProps {
  center: [number, number];
  radiusMeters: number;
  isUserInCoverage?: boolean;
  opacity?: number;
}

const AccurateCoverageCircle: React.FC<AccurateCoverageCircleProps> = ({
  center,
  radiusMeters,
  isUserInCoverage = false,
  opacity = 0.3
}) => {
  // Generate accurate circle points
  const circlePoints = generateCirclePoints(center[0], center[1], radiusMeters);

  return (
    <Polygon
      positions={circlePoints}
      pathOptions={{
        color: isUserInCoverage ? '#22c55e' : '#eab308',
        fillColor: isUserInCoverage ? '#22c55e' : '#eab308',
        fillOpacity: isUserInCoverage ? 0.4 : opacity,
        weight: 2,
        opacity: isUserInCoverage ? 0.8 : 0.6,
      }}
    />
  );
};

export default AccurateCoverageCircle;