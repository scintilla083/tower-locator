// frontend/src/components/UI/InfoPanel.tsx
import React from 'react';
import { Tower, NearestTowerResponse } from '../../types';

interface InfoPanelProps {
  towers: Tower[];
  nearestTower: NearestTowerResponse | null;
  userPosition: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  onGenerateTowers: () => void;
  onClearTowers: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  towers,
  nearestTower,
  userPosition,
  isLoading,
  error,
  onGenerateTowers,
  onClearTowers
}) => {
  console.log('InfoPanel render:', { towers: towers.length, isLoading, error, nearestTower });

  const handleGenerateTowers = () => {
    console.log('Generate towers button clicked');
    onGenerateTowers();
  };

  const handleClearTowers = () => {
    console.log('Clear towers button clicked');
    onClearTowers();
  };

  // Safe access to nearest tower data
  const safeNearestTower = nearestTower?.tower;
  const safeDistance = nearestTower?.distance_km;
  const safeSignalStrength = safeNearestTower?.signal_strength ?? 0;
  const safeCoverageRadius = safeNearestTower?.coverage_radius_km ?? 5.0;

  return (
    <div className="info-panel">
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.25rem'
        }}>
          Tower Locator
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Click on map to find nearest tower
        </p>
      </div>

      {/* Debug Info */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.5rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontFamily: 'monospace'
      }}>
        <div>Loading: {isLoading ? 'YES' : 'NO'}</div>
        <div>Towers: {towers.length}</div>
        <div>Error: {error || 'None'}</div>
        <div>Nearest: {nearestTower ? 'Found' : 'None'}</div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={handleGenerateTowers}
          disabled={isLoading}
          style={{
            width: '100%',
            backgroundColor: isLoading ? '#93c5fd' : '#2563eb',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            fontWeight: '500',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Generating...
            </>
          ) : (
            '+ Generate 20 Towers'
          )}
        </button>

        <button
          onClick={handleClearTowers}
          disabled={isLoading}
          style={{
            width: '100%',
            backgroundColor: isLoading ? '#fca5a5' : '#dc2626',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            fontWeight: '500',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          🗑️ Clear All Towers
        </button>
      </div>

      {/* Status */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.875rem',
          marginBottom: '0.25rem'
        }}>
          <span style={{ color: '#6b7280' }}>Total Towers:</span>
          <span style={{ fontWeight: '600', color: '#2563eb' }}>{towers.length}</span>
        </div>

        {userPosition && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          }}>
            <span style={{ color: '#6b7280' }}>Your Position:</span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#1f2937'
            }}>
              {userPosition.lat?.toFixed(4) || '0.0000'}, {userPosition.lng?.toFixed(4) || '0.0000'}
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#dbeafe',
          border: '1px solid #bfdbfe',
          borderRadius: '0.375rem'
        }}>
          <p style={{
            color: '#1d4ed8',
            fontSize: '0.875rem',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            ⏳ Processing request...
          </p>
        </div>
      )}

      {/* Nearest Tower Info */}
      {nearestTower && safeNearestTower && !isLoading && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem'
        }}>
          <h3 style={{
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📡 Nearest Tower
            {safeNearestTower.is_in_coverage && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '0.75rem',
                borderRadius: '9999px'
              }}>
                In Coverage
              </span>
            )}
          </h3>

          <div style={{ fontSize: '0.875rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}>
              <span style={{ color: '#6b7280' }}>Name:</span>
              <span style={{ fontWeight: '500' }}>{safeNearestTower.name || 'Unknown'}</span>
            </div>

            {safeDistance !== null && safeDistance !== undefined && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem'
              }}>
                <span style={{ color: '#6b7280' }}>Distance:</span>
                <span style={{
                  fontWeight: '500',
                  color: safeNearestTower.is_in_coverage ? '#059669' : '#d97706'
                }}>
                  {safeDistance.toFixed(2)} km
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}>
              <span style={{ color: '#6b7280' }}>Signal:</span>
              <span style={{ fontWeight: '500' }}>{safeSignalStrength.toFixed(1)}%</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}>
              <span style={{ color: '#6b7280' }}>Coverage:</span>
              <span style={{ fontWeight: '500' }}>{safeCoverageRadius.toFixed(1)} km</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#6b7280' }}>Type:</span>
              <span style={{ fontWeight: '500' }}>{safeNearestTower.tower_type || '4G'}</span>
            </div>
          </div>

          {/* Coverage Status */}
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            textAlign: 'center',
            backgroundColor: safeNearestTower.is_in_coverage ? '#dcfce7' : '#fed7aa',
            color: safeNearestTower.is_in_coverage ? '#166534' : '#9a3412'
          }}>
            {safeNearestTower.is_in_coverage
              ? '✅ You are within coverage zone'
              : '⚠️ You are outside coverage zone'
            }
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !isLoading && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem'
        }}>
          <p style={{
            color: '#b91c1c',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            ❌ Error
          </p>
          <p style={{
            color: '#dc2626',
            fontSize: '0.75rem',
            marginTop: '0.25rem'
          }}>
            {error}
          </p>
        </div>
      )}

      {/* Success message for towers */}
      {towers.length > 0 && !isLoading && !error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '0.375rem'
        }}>
          <p style={{
            color: '#047857',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            ✅ {towers.length} towers loaded successfully!
          </p>
        </div>
      )}

      {/* Instructions */}
      {!userPosition && towers.length > 0 && !isLoading && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.375rem'
        }}>
          <p style={{
            color: '#1d4ed8',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            💡 Tip
          </p>
          <p style={{
            color: '#2563eb',
            fontSize: '0.75rem',
            marginTop: '0.25rem'
          }}>
            Click anywhere on the map to find the nearest tower and check coverage
          </p>
        </div>
      )}

      {towers.length === 0 && !isLoading && !error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem'
        }}>
          <p style={{
            color: '#374151',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            🏗️ Get Started
          </p>
          <p style={{
            color: '#6b7280',
            fontSize: '0.75rem',
            marginTop: '0.25rem'
          }}>
            Generate some towers to begin exploring coverage areas
          </p>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;