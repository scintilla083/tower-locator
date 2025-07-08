// frontend/src/components/Map/BoundsSelector.tsx
import React, { useState, useRef } from 'react';
import { Rectangle, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';

interface BoundsSelectorProps {
  isActive: boolean;
  onBoundsSelected: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onCancel: () => void;
}

const BoundsSelector: React.FC<BoundsSelectorProps> = ({
  isActive,
  onBoundsSelected,
  onCancel
}) => {
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useMapEvents({
    mousedown: (e) => {
      if (!isActive) return;

      console.log('Mouse down at:', e.latlng);
      setStartPoint([e.latlng.lat, e.latlng.lng]);
      setEndPoint([e.latlng.lat, e.latlng.lng]);
      setIsDrawing(true);
    },
    mousemove: (e) => {
      if (!isActive || !isDrawing || !startPoint) return;

      setEndPoint([e.latlng.lat, e.latlng.lng]);
    },
    mouseup: (e) => {
      if (!isActive || !isDrawing || !startPoint) return;

      console.log('Mouse up at:', e.latlng);
      const finalEndPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      setEndPoint(finalEndPoint);
      setIsDrawing(false);

      // Calculate bounds
      const bounds = {
        north: Math.max(startPoint[0], finalEndPoint[0]),
        south: Math.min(startPoint[0], finalEndPoint[0]),
        east: Math.max(startPoint[1], finalEndPoint[1]),
        west: Math.min(startPoint[1], finalEndPoint[1])
      };

      console.log('Selected bounds:', bounds);
      onBoundsSelected(bounds);

      // Reset state
      setStartPoint(null);
      setEndPoint(null);
    },
    keydown: (e) => {
      if (e.originalEvent.key === 'Escape') {
        onCancel();
        setStartPoint(null);
        setEndPoint(null);
        setIsDrawing(false);
      }
    }
  });

  // Show rectangle if we have both points
  if (isActive && startPoint && endPoint) {
    const bounds = new LatLngBounds(startPoint, endPoint);

    return (
      <Rectangle
        bounds={bounds}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '5, 5'
        }}
      />
    );
  }

  return null;
};

export default BoundsSelector;