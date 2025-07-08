// frontend/src/components/Map/BoundsSelector.tsx
import React, { useState, useEffect } from 'react';
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
  const [firstClick, setFirstClick] = useState<[number, number] | null>(null);
  const [secondClick, setSecondClick] = useState<[number, number] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Reset state when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setFirstClick(null);
      setSecondClick(null);
      setShowPreview(false);
    }
  }, [isActive]);

  useMapEvents({
    click: (e) => {
      if (!isActive) return;

      console.log('Bounds selector click:', e.latlng);

      if (!firstClick) {
        // First click - set corner
        console.log('First corner selected:', e.latlng);
        setFirstClick([e.latlng.lat, e.latlng.lng]);
        setShowPreview(false);
      } else if (!secondClick) {
        // Second click - complete selection
        const secondPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        console.log('Second corner selected:', e.latlng);
        setSecondClick(secondPoint);

        // Calculate bounds
        const bounds = {
          north: Math.max(firstClick[0], secondPoint[0]),
          south: Math.min(firstClick[0], secondPoint[0]),
          east: Math.max(firstClick[1], secondPoint[1]),
          west: Math.min(firstClick[1], secondPoint[1])
        };

        console.log('Final bounds calculated:', bounds);

        // Show preview for 1 second, then confirm
        setShowPreview(true);
        setTimeout(() => {
          onBoundsSelected(bounds);
        }, 1000);
      }
    },
    keydown: (e) => {
      if (e.originalEvent.key === 'Escape') {
        console.log('Bounds selection cancelled with ESC');
        onCancel();
      }
    }
  });

  // Show preview rectangle if we have both points or are showing final preview
  if (isActive && firstClick && (secondClick || showPreview)) {
    const bounds = new LatLngBounds(firstClick, secondClick || firstClick);

    return (
      <Rectangle
        bounds={bounds}
        pathOptions={{
          color: showPreview ? '#10b981' : '#3b82f6',
          fillColor: showPreview ? '#10b981' : '#3b82f6',
          fillOpacity: showPreview ? 0.3 : 0.2,
          weight: showPreview ? 3 : 2,
          dashArray: showPreview ? undefined : '5, 5'
        }}
      />
    );
  }

  // Show first click marker
  if (isActive && firstClick && !secondClick) {
    // Create a small circle around first click
    const smallBounds = new LatLngBounds(
      [firstClick[0] - 0.001, firstClick[1] - 0.001],
      [firstClick[0] + 0.001, firstClick[1] + 0.001]
    );

    return (
      <Rectangle
        bounds={smallBounds}
        pathOptions={{
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.5,
          weight: 2
        }}
      />
    );
  }

  return null;
};

export default BoundsSelector;