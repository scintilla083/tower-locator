// frontend/src/components/Map/AccurateCoverageCircle.tsx
import React from 'react';
import { Polygon } from 'react-leaflet';

interface AccurateCoverageCircleProps {
  center: [number, number];
  radiusMeters: number;
  isUserInCoverage?: boolean;
  opacity?: number;
}

// Function to generate accurate circle points using geodesic calculations
function generateCirclePoints(centerLat: number, centerLng: number, radiusMeters: number, numPoints: number = 64): [number, number][] {
  const points: [number, number][] = [];
  const earthRadius = 6371000; // Earth's radius in meters

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 360) / numPoints;
    const angleRad = (angle * Math.PI) / 180;

    // Calculate the point at the given distance and bearing
    const centerLatRad = (centerLat * Math.PI) / 180;
    const centerLngRad = (centerLng * Math.PI) / 180;

    const angularDistance = radiusMeters / earthRadius;

    const pointLatRad = Math.asin(
      Math.sin(centerLatRad) * Math.cos(angularDistance) +
      Math.cos(centerLatRad) * Math.sin(angularDistance) * Math.cos(angleRad)
    );

    const pointLngRad = centerLngRad + Math.atan2(
      Math.sin(angleRad) * Math.sin(angularDistance) * Math.cos(centerLatRad),
      Math.cos(angularDistance) - Math.sin(centerLatRad) * Math.sin(pointLatRad)
    );

    const pointLat = (pointLatRad * 180) / Math.PI;
    const pointLng = (pointLngRad * 180) / Math.PI;

    points.push([pointLat, pointLng]);
  }

  return points;
}

const AccurateCoverageCircle: React.FC<AccurateCoverageCircleProps> = ({
  center,
  radiusMeters,
  isUserInCoverage = false,
  opacity = 0.3
}) => {
  // Generate accurate circle points
  const circlePoints = generateCirclePoints(center[0], center[1], radiusMeters);

  console.log(`Accurate Circle: center=[${center[0].toFixed(6)}, ${center[1].toFixed(6)}], radiusMeters=${radiusMeters.toFixed(1)}, points=${circlePoints.length}`);

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