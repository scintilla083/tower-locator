import React, { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from '../../hooks/useMap';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    const position = { lat: e.latlng.lat, lng: e.latlng.lng };
    setUserPosition(position);
    await findNearestTower(position);
  };

  const handleGenerateTowers = async () => {
    const bounds = {
      getNorth: () => mapCenter[0] + 0.1,
      getSouth: () => mapCenter[0] - 0.1,
      getEast: () => mapCenter[1] + 0.1,
      getWest: () => mapCenter[1] - 0.1
    };
    await generateRandomTowers(20, bounds);
  };

  const handleClearTowers = async () => {
    await clearAllTowers();
  };

  return (
    <div className="relative h-full">
      <div className="control-panel">
        <div className="flex flex-col gap-2 mb-3">
          <button
            onClick={handleGenerateTowers}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Создать 20 вышек'}
          </button>

          <button
            onClick={handleClearTowers}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Очистить все'}
          </button>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            {error}
          </div>
        )}

        {towers.length > 0 && (
          <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-blue-700 text-xs">
            Всего вышек: {towers.length}
          </div>
        )}

        {nearestTower && (
          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-700 text-xs">
            Ближайшая: {nearestTower.tower.name} ({nearestTower.distance_km.toFixed(2)} км)
          </div>
        )}
      </div>

      <LeafletMap
        center={mapCenter}
        zoom={10}
        className="h-full w-full"
        onClick={handleMapClick}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {towers.map((tower) => (
          <Marker key={tower.id} position={[tower.latitude, tower.longitude]}>
            <Popup>
              <div>
                <h3>{tower.name}</h3>
                <p>Type: {tower.tower_type}</p>
                <p>Signal: {tower.signal_strength.toFixed(1)}%</p>
                <p>Coords: {tower.latitude.toFixed(4)}, {tower.longitude.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;