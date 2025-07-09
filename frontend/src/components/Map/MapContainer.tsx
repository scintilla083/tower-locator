// frontend/src/components/Map/MapContainer.tsx - Updated with geodesic coverage
import React, { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from '../../hooks/useMap';
import { MAP_CONFIG } from '../../config/constants';
import { formatCoordinates, formatDistance } from '../../utils/calculations';
import TowerMarker from './TowerMarker';
import GeodesicCoveragePolygon from './GeodesicCoveragePolygon';
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
    }
  });

  return null;
}

const MapContainer: React.FC = () => {
  const [isSelectingBounds, setIsSelectingBounds] = useState(false);
  const [selectionStep, setSelectionStep] = useState<'none' | 'first' | 'second'>('none');
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
      if (!e.latlng || typeof e.latlng.lat !== 'number' || typeof e.latlng.lng !== 'number') {
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
    setIsSelectingBounds(true);
    setSelectionStep('first');
    setSelectedBounds(null);
  };

  const handleBoundsSelected = (bounds: { north: number; south: number; east: number; west: number }) => {
    setSelectedBounds(bounds);
    setIsSelectingBounds(false);
    setSelectionStep('none');
  };

  const handleCancelBoundsSelection = () => {
    setIsSelectingBounds(false);
    setSelectionStep('none');
    setSelectedBounds(null);
  };

  const handleGenerateTowers = async () => {
    try {
      let bounds;
      if (selectedBounds) {
        bounds = {
          getNorth: () => selectedBounds.north,
          getSouth: () => selectedBounds.south,
          getEast: () => selectedBounds.east,
          getWest: () => selectedBounds.west
        };
      } else {
        bounds = {
          getNorth: () => MAP_CONFIG.DEFAULT_CENTER[0] + MAP_CONFIG.DEFAULT_BOUNDS_OFFSET.LAT,
          getSouth: () => MAP_CONFIG.DEFAULT_CENTER[0] - MAP_CONFIG.DEFAULT_BOUNDS_OFFSET.LAT,
          getEast: () => MAP_CONFIG.DEFAULT_CENTER[1] + MAP_CONFIG.DEFAULT_BOUNDS_OFFSET.LNG,
          getWest: () => MAP_CONFIG.DEFAULT_CENTER[1] - MAP_CONFIG.DEFAULT_BOUNDS_OFFSET.LNG
        };
      }

      await generateRandomTowers(MAP_CONFIG.DEFAULT_TOWER_COUNT, bounds);
    } catch (error) {
      console.error('Error generating towers:', error);
    }
  };

  const handleClearTowers = async () => {
    try {
      await clearAllTowers();
      setSelectedBounds(null);
    } catch (error) {
      console.error('Error clearing towers:', error);
    }
  };

  // Safe access
  const safeTowers = Array.isArray(towers) ? towers : [];
  const safeUserPosition = userPosition &&
    typeof userPosition.lat === 'number' &&
    typeof userPosition.lng === 'number' ? userPosition : null;
  const safeNearestTower = nearestTower?.tower;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <InfoPanel
        towers={safeTowers}
        nearestTower={nearestTower}
        userPosition={safeUserPosition}
        isLoading={isLoading}
        error={error}
        isSelectingBounds={isSelectingBounds}
        selectionStep={selectionStep}
        onGenerateTowers={handleGenerateTowers}
        onSelectBounds={handleSelectBounds}
        onClearTowers={handleClearTowers}
      />

      <LeafletMap
        center={MAP_CONFIG.DEFAULT_CENTER}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        style={{
          height: '100%',
          width: '100%',
          cursor: isSelectingBounds ? 'crosshair' : 'default'
        }}
        dragging={!isSelectingBounds}
        zoomControl={!isSelectingBounds}
        scrollWheelZoom={!isSelectingBounds}
        doubleClickZoom={!isSelectingBounds}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler
          onMapClick={handleMapClick}
          isSelectingBounds={isSelectingBounds}
        />

        <BoundsSelector
          isActive={isSelectingBounds}
          onBoundsSelected={handleBoundsSelected}
          onCancel={handleCancelBoundsSelection}
        />

        {/* Geodesic Coverage Polygons */}
        {safeTowers.map((tower) => {
          if (!tower || typeof tower.latitude !== 'number' || typeof tower.longitude !== 'number') {
            return null;
          }

          // Use geodesic boundary points if available, otherwise skip
          if (!tower.coverage_boundary_points || tower.coverage_boundary_points.length < 3) {
            console.warn(`Tower ${tower.name} has no valid boundary points`);
            return null;
          }

          const isThisTowerNearestAndInCoverage = safeNearestTower?.id === tower.id &&
                                                  safeNearestTower.is_in_coverage === true;

          return (
            <GeodesicCoveragePolygon
              key={`geodesic-coverage-${tower.id}`}
              boundaryPoints={tower.coverage_boundary_points}
              isUserInCoverage={isThisTowerNearestAndInCoverage}
            />
          );
        })}

        {/* Tower Markers */}
        {safeTowers.map((tower) => {
          if (!tower || typeof tower.latitude !== 'number' || typeof tower.longitude !== 'number') {
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
                  {formatCoordinates(safeUserPosition.lat, safeUserPosition.lng)}
                </p>
                {nearestTower && (
                  <>
                    <p style={{
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      fontWeight: '500',
                      color: nearestTower.tower.is_in_coverage ? '#059669' : '#d97706'
                    }}>
                      {nearestTower.tower.is_in_coverage ? '✅ In Coverage' : '⚠️ Outside Coverage'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Distance: {formatDistance(nearestTower.distance_km)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Coverage: {formatDistance(nearestTower.tower.coverage_radius_km)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Tower: {nearestTower.tower.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Boundary Points: {nearestTower.tower.coverage_boundary_points?.length || 0}
                    </p>
                  </>
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

      {/* Selection Overlay */}
      {isSelectingBounds && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          textAlign: 'center',
          zIndex: 1001,
          fontSize: '1.125rem',
          fontWeight: '500'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            🎯 {selectionStep === 'first' ? 'Click first corner' : 'Click second corner'}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            Press ESC to cancel
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;