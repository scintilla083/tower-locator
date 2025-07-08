// frontend/src/components/Map/Arrow.tsx
import React from 'react';
import { Polyline, Polygon } from 'react-leaflet';

interface ArrowProps {
  start: [number, number];
  end: [number, number];
  color?: string;
  weight?: number;
  opacity?: number;
}

const Arrow: React.FC<ArrowProps> = ({
  start,
  end,
  color = '#dc2626',
  weight = 3,
  opacity = 0.8
}) => {
  // Calculate arrow head
  const calculateArrowHead = (start: [number, number], end: [number, number], size: number = 0.0008) => {
    const dx = end[1] - start[1];
    const dy = end[0] - start[0];
    const angle = Math.atan2(dy, dx);

    // Arrow head points
    const arrowHead1: [number, number] = [
      end[0] - size * Math.cos(angle - Math.PI / 6),
      end[1] - size * Math.sin(angle - Math.PI / 6)
    ];

    const arrowHead2: [number, number] = [
      end[0] - size * Math.cos(angle + Math.PI / 6),
      end[1] - size * Math.sin(angle + Math.PI / 6)
    ];

    return [end, arrowHead1, arrowHead2];
  };

  const arrowHeadPoints = calculateArrowHead(start, end);

  return (
    <>
      {/* Main line */}
      <Polyline
        positions={[start, end]}
        pathOptions={{
          color,
          weight,
          opacity,
          dashArray: '8, 4',
        }}
      />

      {/* Arrow head */}
      <Polygon
        positions={arrowHeadPoints}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 2,
          opacity
        }}
      />
    </>
  );
};

export default Arrow;