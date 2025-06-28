<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Tickets from "./pages/Tickets";

import Checkout from "./pages/Checkout";
import PaymentPage from "./pages/PaymentPage";
import BusinessPortal from "./pages/BusinessPortal";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import ApiErrorBoundary from "./components/common/ApiErrorBoundary";

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <ApiErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/payment" element={<PaymentPage />} />
                        <Route
                            path="/success/:paymentId?"
                            element={<PurchaseSuccess />}
                        />
                        <Route
                            path="/business-portal"
                            element={<BusinessPortal />}
                        />
                    </Routes>
                </ApiErrorBoundary>
            </div>
        </Router>
    );
};
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import Checkout from './pages/Checkout';
import PurchaseSuccess from './pages/PurchaseSuccess';
import BusinessPortal from './pages/BusinessPortal';
import BusinessLogin from './pages/BusinessLogin';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with Navbar */}
        <Route element={<><Navbar /><Outlet /></>}>
          <Route index element={<Home />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="success" element={<PurchaseSuccess />} />
        </Route>

        {/* Business routes without Navbar */}
        <Route path="business">
          <Route path="login" element={<BusinessLogin />} />
          <Route index element={
            <ProtectedRoute>
              <BusinessPortal />
            </ProtectedRoute>
          } />
          <Route path="credits" element={
            <ProtectedRoute>
              <BusinessPortal />
            </ProtectedRoute>
          } />
          <Route path="bookings" element={
            <ProtectedRoute>
              <BusinessPortal />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <BusinessPortal />
            </ProtectedRoute>
          } />
          <Route path="invoices" element={
            <ProtectedRoute>
              <BusinessPortal />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute>
              <BusinessPortal />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <BusinessPortal />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}
>>>>>>> corporate-website

export default App;
