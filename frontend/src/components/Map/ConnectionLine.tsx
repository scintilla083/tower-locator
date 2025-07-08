// frontend/src/components/Map/ConnectionLine.tsx
import React from 'react';
import { Polyline } from 'react-leaflet';

interface ConnectionLineProps {
  start: [number, number];
  end: [number, number];
  isInCoverage?: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  isInCoverage = false
}) => {
  return (
    <Polyline
      positions={[start, end]}
      pathOptions={{
        color: isInCoverage ? '#22c55e' : '#dc2626',
        weight: 2,
        opacity: 0.8,
        dashArray: isInCoverage ? undefined : '8, 4',
      }}
    />
  );
};

export default ConnectionLine;