import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import SeatsIoChart, {
    CustomSeatTooltip,
} from "../components/seatsio/SeatsIoChart";
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
    ticketType?: string;
}

interface MatchData {
    eventId: string;
    name: string;
    date: string;
    time: string;
    venue: string;
    stage: "Semi-Final" | "3rd Place Play-off" | "Final";
    homeTeam: {
        name: string;
        shortCode: string;
        logoUrl: string;
    };
    awayTeam: {
        name: string;
        shortCode: string;
        logoUrl: string;
    };
    venueAddress: string;
    gateOpensAt: string;
    contactEmail: string;
}

const SeatsIOPage: React.FC = () => {
    const { eventKey } = useParams<{ eventKey: string }>();
    const navigate = useNavigate();
    const { showError, toasts, removeToast } = useToast();

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [customTooltip, setCustomTooltip] = useState<{
        visible: boolean;
        seat: SeatsIOSeat | null;
        position: { x: number; y: number };
    }>({
        visible: false,
        seat: null,
        position: { x: 0, y: 0 },
    });

    // Load match data from sessionStorage
    useEffect(() => {
        const storedMatchData = sessionStorage.getItem("selectedMatchData");
        if (storedMatchData) {
            try {
                const parsedMatchData = JSON.parse(storedMatchData);
                setMatchData(parsedMatchData);
            } catch (error) {
                console.error("Failed to parse stored match data:", error);
                showError("Failed to load match information");
            }
        } else {
            showError(
                "No match selected. Please select a match from the tickets page."
            );
            navigate("/tickets-demo");
        }
    }, [showError, navigate]);

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

        if (!matchData) {
            showError("Match information is missing");
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

            const demoCheckoutData = {
                selectedSeats: selectedSeats.map((seat) => ({
                    id: seat.id,
                    label: seat.label,
                    category: seat.category,
                    price: seat.price,
                    ticketType: seat.ticketType || "adult",
                })),
                totalPrice,
                currency: "GBP",
                match: matchData,
            };

            // Store checkout data for the demo checkout page
            sessionStorage.setItem(
                "demoCheckoutData",
                JSON.stringify(demoCheckoutData)
            );

            // Navigate to cart
            navigate("/cart");
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
            <div className="relative min-h-screen bg-blacko">
                {/* Background Gradient */}
                <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
                <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

                {/* Content */}
                <div className="relative min-h-screen flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <AlertCircle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-medium text-white mb-4">
                            Invalid Event
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Event key is required to display the seating chart
                        </p>
                        <button
                            onClick={handleGoBack}
                            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

            {/* Content */}
            <div className="relative">
                {/* Header */}
                <div className="pt-24 sm:pt-32 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex items-center gap-6 mb-12"
                        >
                            <button
                                onClick={handleGoBack}
                                className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-white/10"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-medium text-white tracking-wide">
                                    Select Your Seats
                                </h1>
                                {matchData && (
                                    <p className="text-gray-300 text-lg mt-2">
                                        {matchData.name}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1300px] min-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative">
                    <CustomSeatTooltip tooltip={customTooltip} />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative overflow-hidden"
                    >
                        {/* Background blur effect with enhanced gradient */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl rounded-3xl border border-white/10" />

                        {/* Enhanced ambient glow effects */}
                        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-[100px] mix-blend-soft-light" />
                        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-[100px] mix-blend-soft-light" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-white/5 blur-[100px] mix-blend-soft-light" />

                        {/* Subtle geometric pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0%,rgba(255,255,255,0.02)_100%)] bg-[size:4px_4px] opacity-20" />

                        {/* Content */}
                        <div className="relative p-0">
                            <SeatsIoChart
                                eventKey={eventKey}
                                onSelect={handleSeatSelect}
                                onDeselect={handleSeatDeselect}
                                onCheckout={handleCheckout}
                                onTooltipChange={setCustomTooltip}
                                className="w-full"
                                testMode={true}
                                region="eu"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Checkout Status */}
                {isCheckingOut && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-8 max-w-md w-full mx-4 border border-white/10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                                <h3 className="text-lg font-medium text-white mb-2">
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
            </div>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default SeatsIOPage;
