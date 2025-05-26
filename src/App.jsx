import React, { useEffect, useState } from 'react';
import Calculator from './Calculator';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [suburbs, setSuburbs] = useState([]);

  useEffect(() => {
    fetch('/Suburbs.json')
      .then((res) => res.json())
      .then((data) => setSuburbs(data))
      .catch((err) => console.error('Failed to load suburbs:', err));
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/calculator/:clientId"
          element={
            suburbs.length > 0 ? (
              <Calculator suburbs={suburbs} />
            ) : (
              <p className="p-8">Loading suburbs data...</p>
            )
          }
        />
        <Route path="*" element={<div className="text-center p-8">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;



