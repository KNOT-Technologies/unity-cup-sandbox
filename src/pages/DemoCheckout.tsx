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
}

interface DemoCheckoutData {
    selectedSeats: DemoSeat[];
    totalPrice: number;
    currency: string;
    eventDetails: {
        name: string;
        date: string;
        time: string;
        venue: string;
    };
}

const DemoCheckout = () => {
    const navigate = useNavigate();
    const { showError, toasts, removeToast } = useToast();

    const [checkoutData, setCheckoutData] = useState<DemoCheckoutData | null>(
        null
    );
    const [ticketHolders, setTicketHolders] = useState<TicketHolderInfo[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Record<string, Record<string, string>>
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
        {
            id: "card2",
            number: "**** **** **** 5555",
            holder: "Ahmed Abdallah",
            expiry: "09/27",
            type: "Mastercard",
            isDefault: false,
        },
    ];

    // Load checkout data from sessionStorage and initialize ticket holders
    useEffect(() => {
        const storedData = sessionStorage.getItem("demoCheckoutData");
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                setCheckoutData(data);

                // Initialize ticket holders based on selected seats
                const initialTicketHolders = data.selectedSeats.map(
                    (seat: DemoSeat, index: number) => ({
                        fullName: "",
                        email: index === 0 ? "" : "", // Only first ticket holder gets email
                        phone: "",
                        dateOfBirth: "",
                    })
                );
                setTicketHolders(initialTicketHolders);
            } catch (error) {
                console.error("Failed to parse checkout data:", error);
                showError("Invalid checkout data. Please try again.");
                navigate("/tickets");
            }
        } else {
            showError("No seats selected. Please select seats first.");
            navigate("/tickets");
        }
    }, [navigate, showError]);

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: string): number => {
        if (!dateOfBirth) return 0;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
    };

    // Check if a seat is for senior ticket
    const isSeniorTicket = (seat: DemoSeat): boolean => {
        return seat.ticketType.toLowerCase() === "senior";
    };

    // Validation
    const validateForm = () => {
        const errors: Record<string, Record<string, string>> = {};

        ticketHolders.forEach((holder, index) => {
            const holderErrors: Record<string, string> = {};

            if (!holder.fullName.trim()) {
                holderErrors.fullName = "Full name is required";
            }

            // Email validation only for first ticket holder
            if (index === 0) {
                if (!holder.email.trim()) {
                    holderErrors.email = "Email is required";
                } else if (!/\S+@\S+\.\S+/.test(holder.email)) {
                    holderErrors.email = "Please enter a valid email address";
                }
            }

            if (!holder.phone.trim()) {
                holderErrors.phone = "Phone number is required";
            }

            if (!holder.dateOfBirth) {
                holderErrors.dateOfBirth = "Date of birth is required";
            } else {
                // Age validation for senior tickets
                const seat = checkoutData?.selectedSeats[index];
                if (seat && isSeniorTicket(seat)) {
                    const age = calculateAge(holder.dateOfBirth);
                    if (age < 65) {
                        holderErrors.dateOfBirth =
                            "Senior tickets require holder to be 65 years or older";
                    }
                }
            }

            if (Object.keys(holderErrors).length > 0) {
                errors[index] = holderErrors;
            }
        });

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
            // Call the Unity Cup API
            const checkoutResponse = await processDemoCheckout({
                selectedSeats: checkoutData.selectedSeats,
                ticketHolders: ticketHolders.map((holder, index) => ({
                    fullName: holder.fullName,
                    email: index === 0 ? holder.email : undefined, // Only first holder gets email
                    phone: holder.phone,
                    dateOfBirth: holder.dateOfBirth,
                })),
                totalAmount: checkoutData.totalPrice,
                currency: checkoutData.currency,
                eventDetails: checkoutData.eventDetails,
            });

            // Prepare order data for success page
            const orderData = {
                orderId: checkoutResponse.orderId,
                seats: checkoutData.selectedSeats,
                ticketHolders,
                totalAmount: checkoutData.totalPrice,
                currency: checkoutData.currency,
                eventDetails: checkoutData.eventDetails,
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
        holderIndex: number,
        field: keyof TicketHolderInfo,
        value: string
    ) => {
        setTicketHolders((prev) =>
            prev.map((holder, index) =>
                index === holderIndex ? { ...holder, [field]: value } : holder
            )
        );

        // Clear validation error when user starts typing
        if (validationErrors[holderIndex]?.[field]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors[holderIndex]) {
                    const holderErrors = { ...newErrors[holderIndex] };
                    delete holderErrors[field];
                    if (Object.keys(holderErrors).length === 0) {
                        delete newErrors[holderIndex];
                    } else {
                        newErrors[holderIndex] = holderErrors;
                    }
                }
                return newErrors;
            });
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (!checkoutData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Seat Selection
                    </button>

                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Complete Your Booking
                    </h1>
                    <p className="text-xl text-gray-300">
                        Review your selection and enter details for each ticket
                        holder
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
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50 sticky top-24">
                            <h2 className="text-2xl font-bold text-amber-400 mb-6">
                                Order Summary
                            </h2>

                            {/* Event Info */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3 text-white text-md">
                                    {checkoutData.eventDetails.name}
                                </h3>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-amber-400" />
                                        {checkoutData.eventDetails.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                        {checkoutData.eventDetails.time}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-amber-400" />
                                        {checkoutData.eventDetails.venue}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Seats */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Selected Seats (
                                    {checkoutData.selectedSeats.length})
                                </h4>
                                <div className="space-y-2">
                                    {checkoutData.selectedSeats.map(
                                        (seat, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0"
                                            >
                                                <div>
                                                    <span className="text-white font-medium">
                                                        Seat {seat.label}
                                                    </span>
                                                    <div className="text-sm text-gray-400">
                                                        {seat.category} •{" "}
                                                        {seat.ticketType}
                                                    </div>
                                                </div>
                                                <span className="text-amber-400 font-semibold">
                                                    ${seat.price.toFixed(2)}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-700 pt-4">
                                <div className="flex justify-between items-center text-xl font-medium">
                                    <span className="text-white">Total</span>
                                    <span className="text-amber-400">
                                        ${checkoutData.totalPrice.toFixed(2)}{" "}
                                        {checkoutData.currency}
                                    </span>
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
                            {/* Ticket Holder Forms */}
                            {ticketHolders.map((holder, index) => {
                                const seat = checkoutData.selectedSeats[index];
                                const isSenior = seat && isSeniorTicket(seat);

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.1 * (index + 1),
                                        }}
                                        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50"
                                    >
                                        <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Ticket Holder {index + 1} - Seat{" "}
                                            {seat?.label}
                                            {isSenior && (
                                                <span className="text-sm bg-orange-500 text-white px-2 py-1 rounded-full">
                                                    Senior
                                                </span>
                                            )}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={holder.fullName}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            index,
                                                            "fullName",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors ${
                                                        validationErrors[index]
                                                            ?.fullName
                                                            ? "border-red-500"
                                                            : "border-gray-600"
                                                    }`}
                                                    placeholder="Enter full name"
                                                />
                                                {validationErrors[index]
                                                    ?.fullName && (
                                                    <p className="text-red-400 text-sm mt-1">
                                                        {
                                                            validationErrors[
                                                                index
                                                            ].fullName
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Date of Birth *
                                                    {isSenior && (
                                                        <span className="text-orange-400 ml-1">
                                                            (65+ required)
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={holder.dateOfBirth}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            index,
                                                            "dateOfBirth",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors ${
                                                        validationErrors[index]
                                                            ?.dateOfBirth
                                                            ? "border-red-500"
                                                            : "border-gray-600"
                                                    }`}
                                                />
                                                {validationErrors[index]
                                                    ?.dateOfBirth && (
                                                    <p className="text-red-400 text-sm mt-1">
                                                        {
                                                            validationErrors[
                                                                index
                                                            ].dateOfBirth
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Email field only for first ticket holder */}
                                            {index === 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={holder.email}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                index,
                                                                "email",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors ${
                                                            validationErrors[
                                                                index
                                                            ]?.email
                                                                ? "border-red-500"
                                                                : "border-gray-600"
                                                        }`}
                                                        placeholder="your.email@example.com"
                                                    />
                                                    {validationErrors[index]
                                                        ?.email && (
                                                        <p className="text-red-400 text-sm mt-1">
                                                            {
                                                                validationErrors[
                                                                    index
                                                                ].email
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={holder.phone}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            index,
                                                            "phone",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors ${
                                                        validationErrors[index]
                                                            ?.phone
                                                            ? "border-red-500"
                                                            : "border-gray-600"
                                                    }`}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                                {validationErrors[index]
                                                    ?.phone && (
                                                    <p className="text-red-400 text-sm mt-1">
                                                        {
                                                            validationErrors[
                                                                index
                                                            ].phone
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Payment Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.1 * (ticketHolders.length + 1),
                                }}
                                className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50"
                            >
                                <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Method
                                </h3>

                                {/* Saved Cards */}
                                <div className="space-y-4 mb-6">
                                    {demoCards.map((card) => (
                                        <div
                                            key={card.id}
                                            onClick={() =>
                                                setSelectedCardId(card.id)
                                            }
                                            className={`relative cursor-pointer transition-all duration-200 rounded-xl ${
                                                selectedCardId === card.id
                                                    ? "ring-2 ring-amber-400"
                                                    : "hover:ring-1 hover:ring-gray-500"
                                            }`}
                                        >
                                            <div
                                                className={`bg-gradient-to-r ${
                                                    card.type === "Visa"
                                                        ? "from-blue-600 to-purple-600"
                                                        : "from-red-600 to-pink-600"
                                                } rounded-xl p-6 relative overflow-hidden`}
                                            >
                                                {/* Selection indicator */}
                                                {selectedCardId === card.id && (
                                                    <div className="absolute top-4 right-4 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-black" />
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
                                                            CARDHOLDER NAME
                                                        </div>
                                                        <div className="font-semibold">
                                                            {card.holder}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-200 mb-1">
                                                            EXPIRES
                                                        </div>
                                                        <div className="font-semibold">
                                                            {card.expiry}
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
                                        className="w-full border-2 border-dashed border-gray-600 hover:border-amber-400 rounded-xl p-6 flex items-center justify-center gap-3 text-gray-400 hover:text-amber-400 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="font-medium">
                                            Add New Card
                                        </span>
                                    </button>

                                    {/* Add Card Form (collapsed by default) */}
                                    {showAddCard && (
                                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/50">
                                            <h4 className="text-white font-semibold mb-4">
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
                                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
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
                                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
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
                                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
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
                                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-3 italic">
                                                * Add card functionality is
                                                disabled in demo mode
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Security Info */}
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                                    <Lock className="w-4 h-4" />
                                    <span>
                                        Your information is secure and encrypted
                                    </span>
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isProcessing}
                                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                                className={`w-full py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                                    isProcessing
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:from-amber-400 hover:to-orange-500"
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
                                        Complete Booking - $
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
    );
};

export default DemoCheckout;
