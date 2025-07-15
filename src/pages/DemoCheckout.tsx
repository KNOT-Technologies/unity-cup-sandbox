import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CreditCard,
    User,
    Calendar,
    MapPin,
    Clock,
    Users,
    CheckCircle,
    Lock,
    Plus,
    Check,
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";
import { processDemoCheckout } from "../api/knot";
import { formatSeatDisplay } from "../utils/seatParser";
import { useUserAuth } from "../contexts/UserAuthContext";

// Types for selected seats (coming from SeatsIO)
interface DemoSeat {
    id: string;
    label: string;
    category: string;
    price: number;
    ticketType: string;
}

interface TicketHolderInfo {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
}

interface DemoCheckoutData {
    selectedSeats: DemoSeat[];
    totalPrice: number;
    currency: string;
    match: {
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
    };
}

const DemoCheckout = () => {
    const navigate = useNavigate();
    const { showError, toasts, removeToast } = useToast();
    const { user, isAuthenticated } = useUserAuth();

    const [checkoutData, setCheckoutData] = useState<DemoCheckoutData | null>(
        null
    );
    const [ticketHolder, setTicketHolder] = useState<TicketHolderInfo>({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        nationality: "",
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Partial<Record<keyof TicketHolderInfo, string>>
    >({});
    const [selectedCardId, setSelectedCardId] = useState("card1");
    const [showAddCard, setShowAddCard] = useState(false);

    // Demo credit cards data
    const demoCards = [
        {
            id: "card1",
            number: "**** **** **** 4242",
            holder: "Ahmed Abdallah",
            expiry: "12/28",
            type: "Visa",
            isDefault: true,
        },
    ];

    // Load checkout data from sessionStorage and initialize ticket holders
    useEffect(() => {
        // Clear any potentially corrupted data on initial load
        const clearStaleData = () => {
            try {
                const testData = sessionStorage.getItem("demoCheckoutData");
                if (testData) {
                    const parsed = JSON.parse(testData);
                    if (!parsed.match || !parsed.selectedSeats) {
                        console.log("🧹 Clearing stale checkout data");
                        sessionStorage.removeItem("demoCheckoutData");
                        return true;
                    }
                }
            } catch {
                console.log("🧹 Clearing corrupted checkout data");
                sessionStorage.removeItem("demoCheckoutData");
                return true;
            }
            return false;
        };

        const wasStale = clearStaleData();
        if (wasStale) {
            showError(
                "Previous session data was invalid. Please select seats again."
            );
            navigate("/seats-io");
            return;
        }

        const storedData = sessionStorage.getItem("demoCheckoutData");
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                console.log("🛒 Loading checkout data:", data);

                // Validate that the data has the required structure
                if (
                    !data.selectedSeats ||
                    !Array.isArray(data.selectedSeats) ||
                    !data.match
                ) {
                    console.error("❌ Invalid checkout data structure:", {
                        hasSelectedSeats: !!data.selectedSeats,
                        isSelectedSeatsArray: Array.isArray(data.selectedSeats),
                        hasMatch: !!data.match,
                        data,
                    });
                    showError(
                        "Invalid checkout data structure. Please select seats again."
                    );
                    navigate("/seats-io");
                    return;
                }

                console.log("✅ Checkout data validated successfully");
                setCheckoutData(data);

                // Initialize ticket holder with user data if authenticated, otherwise empty fields
                setTicketHolder({
                    fullName: isAuthenticated && user ? user.fullName : "",
                    email: isAuthenticated && user ? user.email : "",
                    phone: isAuthenticated && user ? user.phone : "",
                    dateOfBirth:
                        isAuthenticated && user ? user.dateOfBirth : "",
                    nationality:
                        isAuthenticated && user ? user.nationality : "Nigerian", // Default nationality
                });
            } catch (error) {
                console.error("Failed to parse checkout data:", error);
                showError("Invalid checkout data. Please try again.");
                navigate("/seats-io");
            }
        } else {
            showError("No seats selected. Please select seats first.");
            navigate("/seats-io");
        }
    }, [navigate, showError]);

    // Validation
    const validateForm = () => {
        const errors: Partial<Record<keyof TicketHolderInfo, string>> = {};

        if (!ticketHolder.fullName.trim()) {
            errors.fullName = "Full name is required";
        }

        if (!ticketHolder.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(ticketHolder.email)) {
            errors.email = "Please enter a valid email address";
        }

        if (!ticketHolder.phone.trim()) {
            errors.phone = "Phone number is required";
        }

        if (!ticketHolder.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !checkoutData) {
            return;
        }

        setIsProcessing(true);

        try {
            // Duplicate ticket holder data for each seat
            const finalTicketHolders = checkoutData.selectedSeats.map(
                (_, index) => ({
                    fullName: ticketHolder.fullName,
                    email: index === 0 ? ticketHolder.email : undefined,
                    phone: ticketHolder.phone,
                    dateOfBirth: ticketHolder.dateOfBirth,
                    nationality: ticketHolder.nationality,
                })
            );

            // Call the Unity Cup API
            const checkoutResponse = await processDemoCheckout({
                selectedSeats: checkoutData.selectedSeats,
                ticketHolders: finalTicketHolders,
                totalAmount: checkoutData.totalPrice,
                currency: checkoutData.currency,
                match: checkoutData.match,
            });

            // Prepare order data for success page by creating a version of ticket holders suitable for display
            const displayTicketHolders = checkoutData.selectedSeats.map(() => ({
                ...ticketHolder,
            }));

            const orderData = {
                orderId: checkoutResponse.orderId,
                seats: checkoutData.selectedSeats,
                ticketHolders: displayTicketHolders,
                totalAmount: checkoutData.totalPrice,
                currency: checkoutData.currency,
                eventDetails: {
                    name: checkoutData.match.name,
                    date: checkoutData.match.date,
                    time: checkoutData.match.time,
                    venue: checkoutData.match.venue,
                },
                match: checkoutData.match,
                emailSent: checkoutResponse.emailSent,
                tickets: checkoutResponse.tickets,
            };

            // Store order data for success page
            sessionStorage.setItem("demoOrderData", JSON.stringify(orderData));

            // Clear checkout data
            sessionStorage.removeItem("demoCheckoutData");

            // Navigate to success page
            navigate("/demo-success");
        } catch (error: unknown) {
            console.error("Checkout error:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Payment failed. Please try again.";
            showError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInputChange = (
        field: keyof TicketHolderInfo,
        value: string
    ) => {
        setTicketHolder((prev) => ({ ...prev, [field]: value }));

        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (!checkoutData || !checkoutData.match) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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

                        <h1 className="text-4xl font-medium mb-4 text-white tracking-wide">
                            Complete Your Booking
                        </h1>
                        <p className="text-xl text-gray-400">
                            Review your selection and enter details for each
                            ticket holder
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-1"
                        >
                            <div className="relative overflow-hidden rounded-3xl sticky top-24">
                                {/* Background blur effect with enhanced gradient */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                {/* Enhanced ambient glow effects */}
                                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />
                                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />

                                {/* Content */}
                                <div className="relative p-8">
                                    <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">
                                        Order Summary
                                    </h2>
                                    {/* Match Info */}
                                    <div className="mb-6">
                                        <h3 className="font-medium mb-3 text-white text-xl">
                                            {checkoutData.match.name}
                                        </h3>
                                        <div className="mb-3 p-3 bg-black/30 rounded-xl">
                                            <div className="text-xs text-blue-400 mb-2 font-medium">
                                                {checkoutData.match.stage}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={
                                                            checkoutData.match
                                                                .homeTeam
                                                                .logoUrl
                                                        }
                                                        alt={
                                                            checkoutData.match
                                                                .homeTeam.name
                                                        }
                                                        className="w-6 h-6"
                                                    />
                                                    <span className="text-white text-sm">
                                                        {
                                                            checkoutData.match
                                                                .homeTeam
                                                                .shortCode
                                                        }
                                                    </span>
                                                </div>
                                                <div className="text-white font-medium">
                                                    {checkoutData.match.homeTeam
                                                        .score !== undefined &&
                                                    checkoutData.match.awayTeam
                                                        .score !== undefined
                                                        ? `${checkoutData.match.homeTeam.score} - ${checkoutData.match.awayTeam.score}`
                                                        : "VS"}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-sm">
                                                        {
                                                            checkoutData.match
                                                                .awayTeam
                                                                .shortCode
                                                        }
                                                    </span>
                                                    <img
                                                        src={
                                                            checkoutData.match
                                                                .awayTeam
                                                                .logoUrl
                                                        }
                                                        alt={
                                                            checkoutData.match
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
                                                    checkoutData.match.date
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                {checkoutData.match.time}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-blue-400" />
                                                {checkoutData.match.venue}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Selected Seats */}
                                    <div className="mb-6">
                                        <h4 className="font-medium mb-3 text-white flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Selected Seats (
                                            {checkoutData.selectedSeats.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {checkoutData.selectedSeats.map(
                                                (seat, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-white font-medium">
                                                                    {formatSeatDisplay(
                                                                        seat.label
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-400 flex items-center gap-2">
                                                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                                                                    {
                                                                        seat.category
                                                                    }
                                                                </span>
                                                                <span className="text-blue-400 text-xs">
                                                                    {
                                                                        seat.ticketType
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-blue-400 font-medium">
                                                            £
                                                            {seat.price.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    {/* Total */}
                                    <div className="border-t border-white/20 pt-4">
                                        <div className="flex justify-between items-center text-xl font-medium">
                                            <span className="text-white">
                                                Total
                                            </span>
                                            <span className="text-blue-400">
                                                £
                                                {checkoutData.totalPrice.toFixed(
                                                    2
                                                )}{" "}
                                                {checkoutData.currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Ticket Holder Forms & Payment */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Ticket Holder Form */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.1,
                                    }}
                                    className="relative overflow-hidden rounded-3xl"
                                >
                                    {/* Background blur effect with enhanced gradient */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                    {/* Enhanced ambient glow effects */}
                                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />
                                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />

                                    {/* Content */}
                                    <div className="relative p-8">
                                        <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-3 tracking-wide">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                Ticket Holder Information
                                            </div>
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        ticketHolder.fullName
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "fullName",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                        validationErrors.fullName
                                                            ? "border-blue-500"
                                                            : "border-gray-600"
                                                    }`}
                                                    placeholder="Enter full name"
                                                />
                                                {validationErrors.fullName && (
                                                    <p className="text-blue-400 text-sm mt-1">
                                                        {
                                                            validationErrors.fullName
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Date of Birth *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={
                                                        ticketHolder.dateOfBirth
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "dateOfBirth",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                        validationErrors.dateOfBirth
                                                            ? "border-blue-500"
                                                            : "border-gray-600"
                                                    }`}
                                                />
                                                {validationErrors.dateOfBirth && (
                                                    <p className="text-blue-400 text-sm mt-1">
                                                        {
                                                            validationErrors.dateOfBirth
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={ticketHolder.email}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "email",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                        validationErrors.email
                                                            ? "border-blue-500"
                                                            : "border-gray-600"
                                                    }`}
                                                    placeholder="your.email@example.com"
                                                />
                                                {validationErrors.email && (
                                                    <p className="text-blue-400 text-sm mt-1">
                                                        {validationErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={ticketHolder.phone}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "phone",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                        validationErrors.phone
                                                            ? "border-blue-500"
                                                            : "border-gray-600"
                                                    }`}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                                {validationErrors.phone && (
                                                    <p className="text-blue-400 text-sm mt-1">
                                                        {validationErrors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Payment Information */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.2,
                                    }}
                                    className="relative overflow-hidden rounded-3xl"
                                >
                                    {/* Background blur effect with enhanced gradient */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                    {/* Enhanced ambient glow effects */}
                                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />
                                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />

                                    {/* Content */}
                                    <div className="relative p-8">
                                        <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2 tracking-wide">
                                            <CreditCard className="w-5 h-5" />
                                            Payment Method
                                        </h3>

                                        {/* Saved Cards */}
                                        <div className="space-y-4 mb-6">
                                            {demoCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    onClick={() =>
                                                        setSelectedCardId(
                                                            card.id
                                                        )
                                                    }
                                                    className={`relative cursor-pointer transition-all duration-200 rounded-xl ${
                                                        selectedCardId ===
                                                        card.id
                                                            ? "ring-2 ring-blue-400"
                                                            : "hover:ring-1 hover:ring-gray-500"
                                                    }`}
                                                >
                                                    <div
                                                        className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 relative overflow-hidden`}
                                                    >
                                                        {/* Selection indicator */}
                                                        {selectedCardId ===
                                                            card.id && (
                                                            <div className="absolute top-4 right-4 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                                                                <Check className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}

                                                        {/* Default badge */}
                                                        {card.isDefault && (
                                                            <div className="absolute top-12 right-4">
                                                                <div className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                                                                    Default
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="text-white mb-4">
                                                            <div className="text-xl font-mono tracking-wider">
                                                                {card.number}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-end text-white">
                                                            <div>
                                                                <div className="text-xs text-gray-200 mb-1">
                                                                    CARDHOLDER
                                                                    NAME
                                                                </div>
                                                                <div className="font-semibold">
                                                                    {
                                                                        card.holder
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-gray-200 mb-1">
                                                                    EXPIRES
                                                                </div>
                                                                <div className="font-semibold">
                                                                    {
                                                                        card.expiry
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="text-xl font-bold">
                                                                {card.type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add New Card Button */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowAddCard(!showAddCard)
                                                }
                                                className="w-full border-2 border-dashed border-white/20 hover:border-blue-400 rounded-xl p-6 flex items-center justify-center gap-3 text-white/40 hover:text-blue-400 transition-colors"
                                            >
                                                <Plus className="w-5 h-5" />
                                                <span className="font-medium tracking-wide">
                                                    Add New Card
                                                </span>
                                            </button>

                                            {/* Add Card Form (collapsed by default) */}
                                            {showAddCard && (
                                                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                                    <h4 className="text-white font-medium mb-4 tracking-wide">
                                                        Add New Card
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm text-gray-400 mb-2">
                                                                Card Number
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="1234 5678 9012 3456"
                                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400"
                                                                disabled
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-2">
                                                                Expiry Date
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="MM/YY"
                                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400"
                                                                disabled
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-2">
                                                                CVV
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="123"
                                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400"
                                                                disabled
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm text-gray-400 mb-2">
                                                                Cardholder Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="John Doe"
                                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400"
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-3 italic">
                                                        * Add card functionality
                                                        is disabled in demo mode
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Security Info */}
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                                            <Lock className="w-4 h-4" />
                                            <span>
                                                Your information is secure and
                                                encrypted
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isProcessing}
                                    whileHover={{
                                        scale: isProcessing ? 1 : 1.02,
                                    }}
                                    whileTap={{
                                        scale: isProcessing ? 1 : 0.98,
                                    }}
                                    className={`w-full py-4 px-8 rounded-xl text-lg font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-3 ${
                                        isProcessing
                                            ? "bg-gray-600 cursor-not-allowed text-white/60"
                                            : "text-black bg-white hover:from-blue-400 hover:to-blue-500"
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-6 h-6" />
                                            Complete Booking - £
                                            {checkoutData.totalPrice.toFixed(2)}
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                </div>

                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            </div>
        </div>
    );
};

export default DemoCheckout;
