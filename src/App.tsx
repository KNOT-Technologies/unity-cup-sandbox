import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import Checkout from './pages/Checkout';
import BusinessPortal from './pages/BusinessPortal';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/business-portal" element={<BusinessPortal />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
