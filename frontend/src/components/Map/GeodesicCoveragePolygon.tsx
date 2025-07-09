// frontend/src/components/Map/GeodesicCoveragePolygon.tsx
import React from 'react';
import { Polygon } from 'react-leaflet';

interface GeodesicCoveragePolygonProps {
  boundaryPoints: [number, number][];
  isUserInCoverage?: boolean;
  opacity?: number;
}

const GeodesicCoveragePolygon: React.FC<GeodesicCoveragePolygonProps> = ({
  boundaryPoints,
  isUserInCoverage = false,
  opacity = 0.3
}) => {
  // Validate boundary points
  if (!boundaryPoints || boundaryPoints.length < 3) {
    console.warn('Invalid boundary points for coverage polygon');
    return null;
  }

  // Ensure all points are valid coordinates
  const validPoints = boundaryPoints.filter(point =>
    Array.isArray(point) &&
    point.length === 2 &&
    typeof point[0] === 'number' &&
    typeof point[1] === 'number' &&
    point[0] >= -90 && point[0] <= 90 &&
    point[1] >= -180 && point[1] <= 180
  );

  if (validPoints.length < 3) {
    console.warn('Insufficient valid boundary points for coverage polygon');
    return null;
  }

  console.log(`Rendering geodesic coverage polygon with ${validPoints.length} points, user in coverage: ${isUserInCoverage}`);

  return (
    <Polygon
      positions={validPoints}
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

export default GeodesicCoveragePolygon;