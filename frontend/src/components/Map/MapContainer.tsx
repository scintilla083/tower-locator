// frontend/src/components/Map/MapContainer.tsx
import React, { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from '../../hooks/useMap';
import TowerMarker from './TowerMarker';
import CoverageCircle from './CoverageCircle';
import ConnectionLine from './ConnectionLine';
import BoundsSelector from './BoundsSelector';
import InfoPanel from '../UI/InfoPanel';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user marker icon
const userIcon = L.divIcon({
  html: `
    <div style="
      background-color: #dc2626;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -8px;
        left: -8px;
        width: 32px;
        height: 32px;
        border: 2px solid #dc2626;
        border-radius: 50%;
        opacity: 0.3;
        animation: ripple 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes ripple {
        0% { transform: scale(0.8); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 0.1; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `,
  className: 'custom-user-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to handle map click events
function MapClickHandler({
  onMapClick,
  isSelectingBounds
}: {
  onMapClick: (e: any) => void;
  isSelectingBounds: boolean;
}) {
  useMapEvents({
    click: (e) => {
      if (!isSelectingBounds) {
        onMapClick(e);
      }
    },
  });
  return null;
}

const MapContainer: React.FC = () => {
  const [mapCenter] = useState<[number, number]>([50.4501, 30.5234]); // Kyiv
  const [isSelectingBounds, setIsSelectingBounds] = useState(false);
  const [selectedBounds, setSelectedBounds] = useState<{
    north: number; south: number; east: number; west: number;
  } | null>(null);

  const {
    towers,
    userPosition,
    nearestTower,
    isLoading,
    error,
    setUserPosition,
    findNearestTower,
    generateRandomTowers,
    clearAllTowers
  } = useMap();

  const handleMapClick = async (e: any) => {
    try {
      console.log('Map clicked:', e.latlng);
      if (!e.latlng || typeof e.latlng.lat !== 'number' || typeof e.latlng.lng !== 'number') {
        console.error('Invalid click coordinates:', e.latlng);
        return;
      }

      const position = { lat: e.latlng.lat, lng: e.latlng.lng };
      setUserPosition(position);
      await findNearestTower(position);
    } catch (error) {
      console.error('Error handling map click:', error);
    }
  };

  const handleSelectBounds = () => {
    console.log('Starting bounds selection...');
    setIsSelectingBounds(true);
    setSelectedBounds(null);
  };

  const handleBoundsSelected = (bounds: { north: number; south: number; east: number; west: number }) => {
    console.log('Bounds selected:', bounds);
    setSelectedBounds(bounds);
    setIsSelectingBounds(false);
  };

  const handleCancelBoundsSelection = () => {
    console.log('Bounds selection cancelled');
    setIsSelectingBounds(false);
    setSelectedBounds(null);
  };

  const handleGenerateTowers = async () => {
    try {
      console.log('Generating towers...');

      let bounds;
      if (selectedBounds) {
        // Use selected bounds
        bounds = {
          getNorth: () => selectedBounds.north,
          getSouth: () => selectedBounds.south,
          getEast: () => selectedBounds.east,
          getWest: () => selectedBounds.west
        };
        console.log('Using selected bounds:', selectedBounds);
      } else {
        // Use default bounds around map center
        bounds = {
          getNorth: () => mapCenter[0] + 0.05, // Smaller default area
          getSouth: () => mapCenter[0] - 0.05,
          getEast: () => mapCenter[1] + 0.075,
          getWest: () => mapCenter[1] - 0.075
        };
        console.log('Using default bounds around center');
      }

      await generateRandomTowers(20, bounds);
    } catch (error) {
      console.error('Error generating towers:', error);
    }
  };

  const handleClearTowers = async () => {
    try {
      console.log('Clearing towers...');
      await clearAllTowers();
      setSelectedBounds(null); // Clear selected bounds too
    } catch (error) {
      console.error('Error clearing towers:', error);
    }
  };

  // Safe access to towers array
  const safeTowers = Array.isArray(towers) ? towers : [];

  // Safe access to user position
  const safeUserPosition = userPosition &&
    typeof userPosition.lat === 'number' &&
    typeof userPosition.lng === 'number' ? userPosition : null;

  // Safe access to nearest tower
  const safeNearestTower = nearestTower?.tower;

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      width: '100%',
      cursor: isSelectingBounds ? 'crosshair' : 'default'
    }}>
      {/* Information Panel */}
      <InfoPanel
        towers={safeTowers}
        nearestTower={nearestTower}
        userPosition={safeUserPosition}
        isLoading={isLoading}
        error={error}
        isSelectingBounds={isSelectingBounds}
        onGenerateTowers={handleGenerateTowers}
        onSelectBounds={handleSelectBounds}
        onClearTowers={handleClearTowers}
      />

      {/* Map */}
      <LeafletMap
        center={mapCenter}
        zoom={12}
        style={{
          height: '100%',
          width: '100%',
          cursor: isSelectingBounds ? 'crosshair' : 'default'
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Map click handler */}
        <MapClickHandler
          onMapClick={handleMapClick}
          isSelectingBounds={isSelectingBounds}
        />

        {/* Bounds selector */}
        <BoundsSelector
          isActive={isSelectingBounds}
          onBoundsSelected={handleBoundsSelected}
          onCancel={handleCancelBoundsSelection}
        />

        {/* Coverage Circles */}
        {safeTowers.map((tower) => {
          // Safe access to tower properties
          if (!tower || typeof tower.latitude !== 'number' || typeof tower.longitude !== 'number') {
            console.warn('Invalid tower data for coverage circle:', tower);
            return null;
          }

          return (
            <CoverageCircle
              key={`coverage-${tower.id}`}
              center={[tower.latitude, tower.longitude]}
              radiusKm={tower.coverage_radius_km || 1.0}
              isUserInCoverage={
                safeNearestTower?.id === tower.id &&
                safeNearestTower.is_in_coverage === true
              }
            />
          );
        })}

        {/* Tower Markers */}
        {safeTowers.map((tower) => {
          // Safe access to tower properties
          if (!tower || typeof tower.latitude !== 'number' || typeof tower.longitude !== 'number') {
            console.warn('Invalid tower data for marker:', tower);
            return null;
          }

          return (
            <TowerMarker
              key={tower.id}
              tower={tower}
              isNearest={safeNearestTower?.id === tower.id}
              isInCoverage={
                safeNearestTower?.id === tower.id &&
                safeNearestTower.is_in_coverage === true
              }
            />
          );
        })}

        {/* User Position Marker */}
        {safeUserPosition && (
          <Marker
            position={[safeUserPosition.lat, safeUserPosition.lng]}
            icon={userIcon}
          >
            <Popup>
              <div style={{ padding: '0.5rem' }}>
                <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                  Your Location
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontFamily: 'monospace'
                }}>
                  {safeUserPosition.lat.toFixed(6)}, {safeUserPosition.lng.toFixed(6)}
                </p>
                {nearestTower && (
                  <p style={{
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    fontWeight: '500',
                    color: nearestTower.tower.is_in_coverage ? '#059669' : '#d97706'
                  }}>
                    {nearestTower.tower.is_in_coverage ? '✅ In Coverage' : '⚠️ Outside Coverage'}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Connection Line */}
        {safeUserPosition && nearestTower && safeNearestTower && (
          <ConnectionLine
            start={[safeUserPosition.lat, safeUserPosition.lng]}
            end={[safeNearestTower.latitude, safeNearestTower.longitude]}
            isInCoverage={safeNearestTower.is_in_coverage === true}
          />
        )}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;