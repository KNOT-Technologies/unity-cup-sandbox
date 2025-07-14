import {
    BrowserRouter as Router,
    Routes,
    Route,
    Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Home from "./pages/Home.tsx";
import TicketsDemo from "./pages/TicketsDemo.tsx";
import Checkout from "./pages/Checkout.tsx";
import PaymentPage from "./pages/PaymentPage.tsx";
import PurchaseSuccess from "./pages/PurchaseSuccess.tsx";
import CreditPurchaseSuccess from "./pages/CreditPurchaseSuccess.tsx";
import SeatsIOPage from "./pages/SeatsIOPage.tsx";
import DemoCheckout from "./pages/DemoCheckout.tsx";
import DemoSuccess from "./pages/DemoSuccess.tsx";
import BusinessPortal from "./pages/BusinessPortal.tsx";
import BusinessLogin from "./pages/BusinessLogin.tsx";
import ProtectedRoute from "./components/common/ProtectedRoute.tsx";
import ApiErrorBoundary from "./components/common/ApiErrorBoundary.tsx";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-900">
                <ApiErrorBoundary>
                    <Routes>
                        {/* Public routes with Navbar */}
                        <Route
                            element={
                                <>
                                    <Navbar />
                                    <Outlet />
                                </>
                            }
                        >
                            <Route index element={<Home />} />
                            <Route path="tickets" element={<TicketsDemo />} />
                            <Route path="checkout" element={<Checkout />} />
                            <Route path="payment" element={<PaymentPage />} />
                            <Route
                                path="success/:paymentId?"
                                element={<PurchaseSuccess />}
                            />
                            <Route
                                path="event/:eventKey/seatsIO"
                                element={<SeatsIOPage />}
                            />
                            <Route
                                path="demo-checkout"
                                element={<DemoCheckout />}
                            />
                            <Route
                                path="demo-success"
                                element={<DemoSuccess />}
                            />
                        </Route>

                        {/* Business routes without Navbar */}
                        <Route path="business">
                            <Route path="login" element={<BusinessLogin />} />
                            <Route
                                index
                                element={
                                    <ProtectedRoute>
                                        <BusinessPortal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="credits"
                                element={
                                    <ProtectedRoute>
                                        <BusinessPortal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="bookings"
                                element={
                                    <ProtectedRoute>
                                        <BusinessPortal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="orders"
                                element={
                                    <ProtectedRoute>
                                        <BusinessPortal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="invoices"
                                element={
                                    <ProtectedRoute>
                                        <BusinessPortal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="reports"
                                element={
                                    <ProtectedRoute>
                                        <BusinessPortal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="settings"
                                element={
                                    <ProtectedRoute>
                                        <BusinessPortal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="credit-success/:paymentId?"
                                element={
                                    <ProtectedRoute>
                                        <CreditPurchaseSuccess />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Routes>
                </ApiErrorBoundary>
            </div>
        </Router>
    );
}

export default App;
