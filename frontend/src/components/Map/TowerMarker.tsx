// frontend/src/components/Map/TowerMarker.tsx
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Tower } from '../../types';

interface TowerMarkerProps {
  tower: Tower;
  isNearest?: boolean;
  isInCoverage?: boolean;
}

// Create custom icons
const createTowerIcon = (isNearest: boolean, isInCoverage: boolean) => {
  let color = '#3b82f6'; // Default blue
  if (isNearest && isInCoverage) {
    color = '#22c55e'; // Bright green for nearest tower with coverage
  } else if (isNearest) {
    color = '#f59e0b'; // Orange for nearest tower without coverage
  }

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        ${isNearest ? `
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 0 ${color}, 0 2px 8px rgba(0,0,0,0.3);
        ` : ''}
      ">
      </div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${color}, 0 2px 8px rgba(0,0,0,0.3); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0), 0 2px 8px rgba(0,0,0,0.3); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0), 0 2px 8px rgba(0,0,0,0.3); }
        }
      </style>
    `,
    className: 'custom-tower-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const TowerMarker: React.FC<TowerMarkerProps> = ({
  tower,
  isNearest = false,
  isInCoverage = false
}) => {
  // Safe access to tower properties with fallbacks
  const safeSignalStrength = tower.signal_strength ?? 0;
  const safeCoverageRadius = tower.coverage_radius_km ?? 5.0;
  const safeLatitude = tower.latitude ?? 0;
  const safeLongitude = tower.longitude ?? 0;
  const safeDistance = tower.distance_km;

  return (
    <Marker
      position={[safeLatitude, safeLongitude]}
      icon={createTowerIcon(isNearest, isInCoverage)}
    >
      <Popup>
        <div className="p-2 min-w-48">
          <h3 className="font-bold text-lg mb-2 text-gray-800">{tower.name || 'Unknown Tower'}</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Type:</span> {tower.tower_type || '4G'}</p>
            <p><span className="font-semibold">Signal:</span> {safeSignalStrength.toFixed(1)}%</p>
            <p><span className="font-semibold">Coverage:</span> {safeCoverageRadius.toFixed(1)} km</p>
            <p><span className="font-semibold">Coordinates:</span> {safeLatitude.toFixed(4)}, {safeLongitude.toFixed(4)}</p>
            {safeDistance !== null && safeDistance !== undefined && (
              <p><span className="font-semibold">Distance:</span> {safeDistance.toFixed(2)} km</p>
            )}
            {isNearest && (
              <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                isInCoverage
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isInCoverage ? '✓ In Coverage' : '⚠ Outside Coverage'}
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default TowerMarker;