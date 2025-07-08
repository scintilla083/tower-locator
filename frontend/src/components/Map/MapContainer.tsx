// frontend/src/components/Map/MapContainer.tsx
import React, { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from '../../hooks/useMap';
import TowerMarker from './TowerMarker';
import CoverageCircle from './CoverageCircle';
import ConnectionLine from './ConnectionLine';
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
function MapClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

const MapContainer: React.FC = () => {
  const [mapCenter] = useState<[number, number]>([50.4501, 30.5234]); // Kyiv
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
    console.log('Map clicked:', e.latlng); // Debug log
    const position = { lat: e.latlng.lat, lng: e.latlng.lng };
    setUserPosition(position);
    await findNearestTower(position);
  };

  const handleGenerateTowers = async () => {
    console.log('Generating towers...'); // Debug log
    const bounds = {
      getNorth: () => mapCenter[0] + 0.1,
      getSouth: () => mapCenter[0] - 0.1,
      getEast: () => mapCenter[1] + 0.15,
      getWest: () => mapCenter[1] - 0.15
    };
    await generateRandomTowers(20, bounds);
  };

  const handleClearTowers = async () => {
    console.log('Clearing towers...'); // Debug log
    await clearAllTowers();
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Information Panel */}
      <InfoPanel
        towers={towers}
        nearestTower={nearestTower}
        userPosition={userPosition}
        isLoading={isLoading}
        error={error}
        onGenerateTowers={handleGenerateTowers}
        onClearTowers={handleClearTowers}
      />

      {/* Map */}
      <LeafletMap
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Map click handler */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Coverage Circles */}
        {towers.map((tower) => (
          <CoverageCircle
            key={`coverage-${tower.id}`}
            center={[tower.latitude, tower.longitude]}
            radiusKm={tower.coverage_radius_km}
            isUserInCoverage={
              nearestTower?.tower.id === tower.id &&
              nearestTower.tower.is_in_coverage === true
            }
          />
        ))}

        {/* Tower Markers */}
        {towers.map((tower) => (
          <TowerMarker
            key={tower.id}
            tower={tower}
            isNearest={nearestTower?.tower.id === tower.id}
            isInCoverage={
              nearestTower?.tower.id === tower.id &&
              nearestTower.tower.is_in_coverage === true
            }
          />
        ))}

        {/* User Position Marker */}
        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
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
                  {userPosition.lat.toFixed(6)}, {userPosition.lng.toFixed(6)}
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
        {userPosition && nearestTower && (
          <ConnectionLine
            start={[userPosition.lat, userPosition.lng]}
            end={[nearestTower.tower.latitude, nearestTower.tower.longitude]}
            isInCoverage={nearestTower.tower.is_in_coverage === true}
          />
        )}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;