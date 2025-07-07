import React from 'react';
import MapContainer from './components/Map/MapContainer';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Tower Locator</h1>
        <p className="text-sm">Click on the map to find the nearest tower</p>
      </header>
      <main className="h-screen">
        <MapContainer />
      </main>
    </div>
  );
}

export default App;