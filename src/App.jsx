import React from 'react';
import suburbs from './Suburbs.json';
import Calculator from './Calculator';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">SmartRent Auto™ - Rent-to-Own Vehicle Calculator</h1>
      <Calculator suburbs={suburbs} />
    </div>
  );
}

export default App;

