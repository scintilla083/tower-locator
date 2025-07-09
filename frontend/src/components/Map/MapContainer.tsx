// frontend/src/components/Map/MapContainer.tsx - With accurate coverage circles
import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from '../../hooks/useMap';
import TowerMarker from './TowerMarker';
import AccurateCoverageCircle from './AccurateCoverageCircle';
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

// Function to calculate distance using Haversine formula (for frontend validation)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Component to handle map click events
function MapClickHandler({
  onMapClick,
  isSelectingBounds,
  towers,
  userPosition,
  nearestTower
}: {
  onMapClick: (e: any) => void;
  isSelectingBounds: boolean;
  towers: any[];
  userPosition: any;
  nearestTower: any;
}) {
  useMapEvents({
    click: (e) => {
      if (!isSelectingBounds) {
        const position = { lat: e.latlng.lat, lng: e.latlng.lng };

        if (towers.length > 0 && nearestTower?.tower) {
          console.log('=== CLICK ANALYSIS ===');
          const clickLat = position.lat.toFixed(6);
          const clickLng = position.lng.toFixed(6);
          console.log(`Click position: lat=${clickLat}, lng=${clickLng}`);

          // Calculate frontend distance to backend's nearest tower
          const frontendDistance = calculateDistance(
            position.lat, position.lng,
            nearestTower.tower.latitude, nearestTower.tower.longitude
          );

          const backendDistance = nearestTower.distance_km * 1000;
          const coverageRadius = nearestTower.tower.coverage_radius_km * 1000;
          const tolerance = Math.max(100, coverageRadius * 0.1);

          console.log(`Tower: ${nearestTower.tower.name}`);
          console.log(`Frontend distance: ${frontendDistance.toFixed(1)}m`);
          console.log(`Backend distance: ${backendDistance.toFixed(1)}m`);
          console.log(`Difference: ${Math.abs(frontendDistance - backendDistance).toFixed(1)}m`);
          console.log(`Coverage radius: ${coverageRadius.toFixed(1)}m`);
          console.log(`Coverage + tolerance: ${(coverageRadius + tolerance).toFixed(1)}m`);
          console.log(`Frontend in coverage: ${frontendDistance <= (coverageRadius + tolerance)}`);
          console.log(`Backend in coverage: ${nearestTower.tower.is_in_coverage}`);
          console.log('====================');
        }

        onMapClick(e);
      }
    }
  });

  return null;
}

const MapContainer: React.FC = () => {
  const [mapCenter] = useState<[number, number]>([50.4501, 30.5234]); // Kyiv
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
      console.log('Map clicked for tower finding:', e.latlng);
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
    setSelectionStep('first');
    setSelectedBounds(null);
  };

  const handleBoundsSelected = (bounds: { north: number; south: number; east: number; west: number }) => {
    console.log('Bounds selected:', bounds);
    setSelectedBounds(bounds);
    setIsSelectingBounds(false);
    setSelectionStep('none');
  };

  const handleCancelBoundsSelection = () => {
    console.log('Bounds selection cancelled');
    setIsSelectingBounds(false);
    setSelectionStep('none');
    setSelectedBounds(null);
  };

  const handleGenerateTowers = async () => {
    try {
      console.log('Generating towers...');

      let bounds;
      if (selectedBounds) {
        bounds = {
          getNorth: () => selectedBounds.north,
          getSouth: () => selectedBounds.south,
          getEast: () => selectedBounds.east,
          getWest: () => selectedBounds.west
        };
        console.log('Using selected bounds:', selectedBounds);
      } else {
        bounds = {
          getNorth: () => mapCenter[0] + 0.025,
          getSouth: () => mapCenter[0] - 0.025,
          getEast: () => mapCenter[1] + 0.035,
          getWest: () => mapCenter[1] - 0.035
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
    <div style={{
      position: 'relative',
      height: '100%',
      width: '100%'
    }}>
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
        center={mapCenter}
        zoom={12}
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
          towers={safeTowers}
          userPosition={safeUserPosition}
          nearestTower={nearestTower}
        />

        <BoundsSelector
          isActive={isSelectingBounds}
          onBoundsSelected={handleBoundsSelected}
          onCancel={handleCancelBoundsSelection}
        />

        {/* ACCURATE Coverage Circles using Polygons */}
        {safeTowers.map((tower) => {
          if (!tower || typeof tower.latitude !== 'number' || typeof tower.longitude !== 'number') {
            return null;
          }

          // CRITICAL: Only use backend result for coverage status
          const isThisTowerNearestAndInCoverage = safeNearestTower?.id === tower.id &&
                                                  safeNearestTower.is_in_coverage === true;

          return (
            <AccurateCoverageCircle
              key={`coverage-${tower.id}`}
              center={[tower.latitude, tower.longitude]}
              radiusMeters={(tower.coverage_radius_km || 1.0) * 1000}
              isUserInCoverage={isThisTowerNearestAndInCoverage}
            />
          );
        })}

        {/* DEBUG: Show backend calculations */}
        {safeUserPosition && safeNearestTower && nearestTower && (
          <>
            {/* Show backend distance as a red circle (using simple Circle for comparison) */}
            <Circle
              center={[safeNearestTower.latitude, safeNearestTower.longitude]}
              radius={nearestTower.distance_km * 1000}
              pathOptions={{
                color: '#ff0000',
                fillColor: 'transparent',
                weight: 1,
                opacity: 0.8,
                dashArray: '3, 3'
              }}
            />
          </>
        )}

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
                  {safeUserPosition.lat.toFixed(6)}, {safeUserPosition.lng.toFixed(6)}
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
                      Distance: {(nearestTower.distance_km * 1000).toFixed(0)}m
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Coverage: {(nearestTower.tower.coverage_radius_km * 1000).toFixed(0)}m
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Tower: {nearestTower.tower.name}
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

      {/* Debug overlay */}
      {safeUserPosition && safeNearestTower && nearestTower && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          zIndex: 1000;
        }}>
          <div>Tower: {safeNearestTower.name}</div>
          <div>Backend Distance: {(nearestTower.distance_km * 1000).toFixed(0)}m</div>
          <div>Coverage Radius: {(safeNearestTower.coverage_radius_km * 1000).toFixed(0)}m</div>
          <div>Backend Status: {safeNearestTower.is_in_coverage ? 'IN' : 'OUT'}</div>
          <div style={{ color: '#eab308' }}>Yellow: Accurate Coverage (Polygon)</div>
          <div style={{ color: '#ff0000' }}>Red: Backend Distance (Circle)</div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;