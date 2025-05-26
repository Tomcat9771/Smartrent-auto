import React, { useEffect, useState } from 'react';
import Calculator from './Calculator';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/calculator/:clientId" element={<Calculator />} />
        {/* Optional default route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}
function App() {
  const [suburbs, setSuburbs] = useState([]);

  useEffect(() => {
    fetch('/Suburbs.json')
      .then((res) => res.json())
      .then((data) => setSuburbs(data))
      .catch((err) => console.error('Failed to load suburbs:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">
        SmartRent Auto™ - Rent-to-Own Vehicle Calculator
      </h1>
      {suburbs.length > 0 ? (
        <Calculator suburbs={suburbs} />
      ) : (
        <p>Loading suburbs data...</p>
      )}
    </div>
  );
}

export default App;


