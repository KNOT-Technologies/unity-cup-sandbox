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

export default App;
