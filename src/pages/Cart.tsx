import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Users,
    ShoppingCart,
    ArrowRight,
    Trash2,
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";
import { formatSeatDisplay } from "../utils/seatParser";
import { useUserAuth } from "../contexts/UserAuthContext";
import UserAuthModal from "../components/auth/UserAuthModal";

// Types for selected seats (coming from SeatsIO)
interface CartSeat {
    id: string;
    label: string;
    category: string;
    price: number;
    ticketType: string;
}

interface MatchData {
    eventId: string;
    name: string;
    date: string;
    time: string;
    venue: string;
    stage: "Group" | "Quarter-Final" | "Semi-Final" | "Final";
    homeTeam: {
        name: string;
        shortCode: string;
        logoUrl: string;
        score?: number;
    };
    awayTeam: {
        name: string;
        shortCode: string;
        logoUrl: string;
        score?: number;
    };
    venueAddress: string;
    gateOpensAt: string;
    contactEmail: string;
}

interface CartData {
    selectedSeats: CartSeat[];
    totalPrice: number;
    currency: string;
    match: MatchData;
}

const Cart = () => {
    const navigate = useNavigate();
    const { showError, toasts, removeToast } = useToast();
    const { isAuthenticated } = useUserAuth();

    const [cartData, setCartData] = useState<CartData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const DEMO_EVENT_ID = "9de3e2b4-2acd-4673-8ee0-e6af4435c222";

    // Load cart data from sessionStorage
    useEffect(() => {
        const storedData = sessionStorage.getItem("demoCheckoutData");
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                console.log("🛒 Loading cart data:", data);

                // Validate that the data has the required structure
                if (
                    !data.selectedSeats ||
                    !Array.isArray(data.selectedSeats) ||
                    !data.match
                ) {
                    console.error("❌ Invalid cart data structure:", {
                        hasSelectedSeats: !!data.selectedSeats,
                        isSelectedSeatsArray: Array.isArray(data.selectedSeats),
                        hasMatch: !!data.match,
                        data,
                    });
                    showError(
                        "Invalid cart data structure. Please select seats again."
                    );
                    navigate(`/event/${DEMO_EVENT_ID}/seatsIO`);
                    return;
                }

                console.log("✅ Cart data validated successfully");
                setCartData(data);
            } catch (error) {
                console.error("Failed to parse cart data:", error);
                showError("Invalid cart data. Please try again.");
                navigate(`/event/${DEMO_EVENT_ID}/seatsIO`);
            }
        } else {
            showError("No seats selected. Please select seats first.");
            navigate(`/event/${DEMO_EVENT_ID}/seatsIO`);
        }
        setIsLoading(false);
    }, [navigate, showError]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleRemoveSeat = (seatId: string) => {
        if (!cartData) return;

        const updatedSeats = cartData.selectedSeats.filter(
            (seat) => seat.id !== seatId
        );

        if (updatedSeats.length === 0) {
            // If no seats left, clear cart and go back to seat selection
            sessionStorage.removeItem("demoCheckoutData");
            showError("Cart is empty. Please select seats again.");
            navigate(`/event/${DEMO_EVENT_ID}/seatsIO`);
            return;
        }

        const updatedCartData = {
            ...cartData,
            selectedSeats: updatedSeats,
            totalPrice: updatedSeats.reduce((sum, seat) => sum + seat.price, 0),
        };

        setCartData(updatedCartData);
        sessionStorage.setItem(
            "demoCheckoutData",
            JSON.stringify(updatedCartData)
        );
    };

    const handleProceedToCheckout = () => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        // User is authenticated, proceed to checkout
        navigate("/demo-checkout");
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        // Automatically proceed to checkout after successful authentication
        navigate("/demo-checkout");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        );
    }

    if (!cartData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-medium text-white mb-4">
                        Cart is Empty
                    </h2>
                    <p className="text-gray-400 mb-8">
                        No seats selected. Please select seats first.
                    </p>
                    <button
                        onClick={() =>
                            navigate(`/event/${DEMO_EVENT_ID}/seatsIO`)
                        }
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Select Seats
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black text-white">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

            {/* Content */}
            <div className="relative pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-6 font-medium tracking-wide"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Seat Selection
                        </button>

                        <h1 className="text-4xl font-medium mb-4 text-white tracking-wide flex items-center gap-3">
                            <ShoppingCart className="w-10 h-10 text-blue-400" />
                            Your Cart
                        </h1>
                        <p className="text-xl text-gray-400">
                            Review your selected seats before proceeding to
                            checkout
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Cart Items */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2"
                        >
                            <div className="relative overflow-hidden rounded-3xl">
                                {/* Background blur effect */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                {/* Content */}
                                <div className="relative p-8">
                                    <h2 className="text-2xl font-medium text-white mb-6 tracking-wide flex items-center gap-2">
                                        <Users className="w-6 h-6" />
                                        Selected Seats (
                                        {cartData.selectedSeats.length})
                                    </h2>

                                    <div className="space-y-4">
                                        {cartData.selectedSeats.map(
                                            (seat, index) => (
                                                <motion.div
                                                    key={seat.id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            0.1 + index * 0.05,
                                                    }}
                                                    className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                            <span className="text-blue-400 font-medium text-sm">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-white font-medium text-lg">
                                                                {formatSeatDisplay(
                                                                    seat.label
                                                                )}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">
                                                                    {
                                                                        seat.category
                                                                    }
                                                                </span>
                                                                <span className="text-white text-sm">
                                                                    {seat.ticketType
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() +
                                                                        seat.ticketType.slice(
                                                                            1
                                                                        )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-white font-medium text-lg">
                                                            £
                                                            {seat.price.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveSeat(
                                                                    seat.id
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
                                                            title="Remove seat"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            <div className="relative overflow-hidden rounded-3xl sticky top-24">
                                {/* Background blur effect */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                {/* Content */}
                                <div className="relative p-8">
                                    <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">
                                        Match Information
                                    </h2>

                                    {/* Match Info */}
                                    <div className="mb-6">
                                        <h3 className="font-medium mb-3 text-white text-xl">
                                            {cartData.match.name}
                                        </h3>
                                        <div className="mb-3 p-3 bg-black/30 rounded-xl">
                                            <div className="text-xs text-blue-400 mb-2 font-medium">
                                                {cartData.match.stage}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={
                                                            cartData.match
                                                                .homeTeam
                                                                .logoUrl
                                                        }
                                                        alt={
                                                            cartData.match
                                                                .homeTeam.name
                                                        }
                                                        className="w-6 h-6"
                                                    />
                                                    <span className="text-white text-sm">
                                                        {
                                                            cartData.match
                                                                .homeTeam
                                                                .shortCode
                                                        }
                                                    </span>
                                                </div>
                                                <div className="text-white font-medium">
                                                    {cartData.match.homeTeam
                                                        .score !== undefined &&
                                                    cartData.match.awayTeam
                                                        .score !== undefined
                                                        ? `${cartData.match.homeTeam.score} - ${cartData.match.awayTeam.score}`
                                                        : "VS"}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-sm">
                                                        {
                                                            cartData.match
                                                                .awayTeam
                                                                .shortCode
                                                        }
                                                    </span>
                                                    <img
                                                        src={
                                                            cartData.match
                                                                .awayTeam
                                                                .logoUrl
                                                        }
                                                        alt={
                                                            cartData.match
                                                                .awayTeam.name
                                                        }
                                                        className="w-6 h-6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {new Date(
                                                    cartData.match.date
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                {cartData.match.time}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-blue-400" />
                                                {cartData.match.venue}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="border-t border-white/20 pt-6 mb-6">
                                        <h3 className="text-lg font-medium text-white mb-4">
                                            Order Summary
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">
                                                    Tickets (
                                                    {
                                                        cartData.selectedSeats
                                                            .length
                                                    }
                                                    )
                                                </span>
                                                <span className="text-white">
                                                    £
                                                    {cartData.totalPrice.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg font-medium pt-3 border-t border-white/10">
                                                <span className="text-white">
                                                    Total
                                                </span>
                                                <span className="text-blue-400">
                                                    £
                                                    {cartData.totalPrice.toFixed(
                                                        2
                                                    )}{" "}
                                                    {cartData.currency}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proceed to Checkout Button */}
                                    <motion.button
                                        onClick={handleProceedToCheckout}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 px-6 bg-white text-black rounded-xl text-lg font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-3 hover:bg-gray-100"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>

                                    <p className="text-xs text-gray-400 mt-4 text-center">
                                        You'll be asked to sign in before
                                        completing your purchase
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

                {/* Authentication Modal */}
                <UserAuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                    initialMode="login"
                />
            </div>
        </div>
    );
};

export default Cart;
