import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import SeatsIoChart from "../components/seatsio/SeatsIoChart";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";

// Types
interface SeatsIOSeat {
    id: string;
    label: string;
    category: string;
    price: number;
    status: "available" | "unavailable" | "selected";
    seatType: "seat" | "table" | "booth" | "generalAdmission";
}

const SeatsIOPage: React.FC = () => {
    const { eventKey } = useParams<{ eventKey: string }>();
    const navigate = useNavigate();
    const { showError, toasts, removeToast } = useToast();

    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Validate eventKey
    useEffect(() => {
        if (!eventKey) {
            showError("Event key is required");
            navigate("/");
        }
    }, [eventKey, navigate, showError]);

    // Handle seat selection
    const handleSeatSelect = (seat: SeatsIOSeat) => {
        console.log("Seat selected:", seat);
        // Optional: Add any additional logic when a seat is selected
    };

    // Handle seat deselection
    const handleSeatDeselect = (seat: SeatsIOSeat) => {
        console.log("Seat deselected:", seat);
        // Optional: Add any additional logic when a seat is deselected
    };

    // Handle checkout process
    const handleCheckout = async (
        selectedSeats: SeatsIOSeat[],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _holdToken?: string // Optional since we don't use it in demo mode
    ) => {
        if (!eventKey) {
            showError("Event key is missing");
            return;
        }

        if (selectedSeats.length === 0) {
            showError("Please select at least one seat");
            return;
        }

        setIsCheckingOut(true);

        try {
            const totalPrice = selectedSeats.reduce(
                (sum, seat) => sum + seat.price,
                0
            );

            // Format selected date for display
            const today = new Date();
            const selectedDate = new Date(today);
            selectedDate.setDate(today.getDate() + 7); // Demo event is next week

            const demoCheckoutData = {
                selectedSeats: selectedSeats.map((seat) => ({
                    id: seat.id,
                    label: seat.label,
                    category: seat.category,
                    price: seat.price,
                    ticketType: "adult", // Default ticket type for demo
                })),
                totalPrice,
                currency: "USD",
                eventDetails: {
                    name: "Unity Cup 2025 - Nigeria vs Jamaica",
                    date: selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                    time: "19:30 GMT",
                    venue: "Fullham Stadium",
                },
            };

            // Store checkout data for the demo checkout page
            sessionStorage.setItem(
                "demoCheckoutData",
                JSON.stringify(demoCheckoutData)
            );

            // Navigate to demo checkout
            navigate("/demo-checkout");
        } catch (error) {
            console.error("Checkout failed:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Checkout failed";
            showError(`Checkout failed: ${errorMessage}`);
        } finally {
            setIsCheckingOut(false);
        }
    };

    // Handle navigation back
    const handleGoBack = () => {
        navigate(-1);
    };

    if (!eventKey) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Invalid Event
                    </h2>
                    <p className="text-gray-400 mb-4">
                        Event key is required to display the seating chart
                    </p>
                    <button
                        onClick={handleGoBack}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleGoBack}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-white">
                                    Select Your Seats
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Event: {eventKey}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <SeatsIoChart
                        eventKey={eventKey}
                        onSelect={handleSeatSelect}
                        onDeselect={handleSeatDeselect}
                        onCheckout={handleCheckout}
                        className="w-full"
                        testMode={true}
                        region="eu"
                    />
                </motion.div>

                {/* Checkout Status */}
                {isCheckingOut && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Processing Checkout
                                </h3>
                                <p className="text-gray-400">
                                    Please wait while we process your seat
                                    selection...
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        How to use the seating chart:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                1
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    Select Seats
                                </p>
                                <p className="text-gray-400">
                                    Click on available seats to select them
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                2
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    Review Selection
                                </p>
                                <p className="text-gray-400">
                                    Check your selected seats in the sidebar
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                3
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    Proceed to Pay
                                </p>
                                <p className="text-gray-400">
                                    Click the Pay button to complete your
                                    purchase
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default SeatsIOPage;
