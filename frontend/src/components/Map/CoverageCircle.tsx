// frontend/src/components/Map/CoverageCircle.tsx - Backend-driven version
import React from 'react';
import { Circle } from 'react-leaflet';

interface CoverageCircleProps {
  center: [number, number];
  radiusKm: number;
  isUserInCoverage?: boolean;
  opacity?: number;
  backendDistance?: number; // NEW: actual distance from backend
  userPosition?: [number, number]; // NEW: user position for backend-based radius
}

const CoverageCircle: React.FC<CoverageCircleProps> = ({
  center,
  radiusKm,
  isUserInCoverage = false,
  opacity = 0.3,
  backendDistance,
  userPosition
}) => {
  // Safe radius calculation with fallback
  let radiusInMeters = (radiusKm && radiusKm > 0 ? radiusKm : 1.0) * 1000;

  // EXPERIMENTAL: If we have backend distance and user position,
  // try to calculate what radius would make the backend distance fit
  if (backendDistance && userPosition && isUserInCoverage !== undefined) {
    const actualBackendDistanceMeters = backendDistance * 1000;
    const originalRadiusMeters = radiusKm * 1000;

    // If backend says user is OUT but visually they're IN,
    // the circle might be too big. Let's show what the backend "sees"
    if (!isUserInCoverage && actualBackendDistanceMeters > originalRadiusMeters) {
      // Backend thinks user is outside - maybe show actual backend distance as radius for comparison
      console.log(`Backend adjustment: Original radius ${originalRadiusMeters}m, Backend distance ${actualBackendDistanceMeters}m`);
      // Keep original radius but add debug info
    }
  }

  // Safe center coordinates with fallbacks
  const safeCenter: [number, number] = [
    center[0] && !isNaN(center[0]) ? center[0] : 50.4501,
    center[1] && !isNaN(center[1]) ? center[1] : 30.5234
  ];

  console.log(`Coverage Circle: center=[${safeCenter[0].toFixed(6)}, ${safeCenter[1].toFixed(6)}], radiusKm=${radiusKm.toFixed(3)}, radiusMeters=${radiusInMeters.toFixed(1)}, backendDistance=${backendDistance ? (backendDistance * 1000).toFixed(1) + 'm' : 'N/A'}`);

  return (
    <Circle
      center={safeCenter}
      radius={radiusInMeters} // Keep using the actual coverage radius
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