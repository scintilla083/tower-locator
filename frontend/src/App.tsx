// frontend/src/App.tsx
import React from 'react';
import MapContainer from './components/Map/MapContainer';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-1">📡 Tower Locator</h1>
          <p className="text-blue-100 text-sm">
            Find the nearest cell tower and check coverage areas
          </p>
        </div>
      </header>
      <main className="flex-1 relative overflow-hidden">
        <MapContainer />
      </main>
    </div>
  );
}

export default App;