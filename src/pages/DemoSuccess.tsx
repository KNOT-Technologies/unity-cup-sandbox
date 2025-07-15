import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle,
    Mail,
    Calendar,
    MapPin,
    Clock,
    Users,
    Ticket,
    Home,
    QrCode,
    MailCheck,
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";
import { formatSeatDisplay } from "../utils/seatParser";

interface DemoOrderData {
    orderId: string;
    seats: Array<{
        id: string;
        label: string;
        category: string;
        price: number;
        ticketType: string;
    }>;
    ticketHolders: Array<{
        fullName: string;
        email: string;
        phone: string;
        dateOfBirth: string;
    }>;
    totalAmount: number;
    currency: string;
    eventDetails: {
        name: string;
        date: string;
        time: string;
        venue: string;
    };
    emailSent?: boolean;
    tickets?: Array<{
        id: string;
        seatLabel: string;
        qrCode: string;
        ticketType: string;
    }>;
}

const DemoSuccess = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, toasts, removeToast } = useToast();
    const [orderData, setOrderData] = useState<DemoOrderData | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const toastShownRef = useRef(false);

    // Load order data from sessionStorage
    useEffect(() => {
        const storedData = sessionStorage.getItem("demoOrderData");
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                setOrderData(data);

                // Use the emailSent status from API response
                if (data.emailSent) {
                    setEmailSent(true);
                    if (!toastShownRef.current) {
                        console.log("Showing success toast for email sent");
                        showSuccess(
                            `Tickets sent to ${data.ticketHolders[0].email}`
                        );
                        toastShownRef.current = true;
                    }
                } else {
                    // If email wasn't sent, show error
                    if (!toastShownRef.current) {
                        console.log("Showing error toast for email not sent");
                        showError(
                            "Failed to send tickets via email. Please contact support."
                        );
                        toastShownRef.current = true;
                    }
                }
            } catch (error) {
                console.error("Failed to parse order data:", error);
                showError("Invalid order data. Please try again.");
                navigate("/tickets");
            }
        } else {
            showError("No order found. Please complete a booking first.");
            navigate("/tickets");
        }
    }, [navigate, showError]);

    // Generate QR code (base64 SVG) - use real QR codes from API if available
    const generateQRCode = (
        seatId: string,
        orderId: string,
        apiQRCode?: string
    ) => {
        // Use API QR code if available, otherwise generate demo QR
        const qrContent = apiQRCode || `${orderId}-${seatId}`;
        return `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                <rect width="120" height="120" fill="white"/>
                <g fill="black">
                    <rect x="10" y="10" width="10" height="10"/>
                    <rect x="30" y="10" width="10" height="10"/>
                    <rect x="50" y="10" width="10" height="10"/>
                    <rect x="70" y="10" width="10" height="10"/>
                    <rect x="90" y="10" width="10" height="10"/>
                    <rect x="110" y="10" width="10" height="10"/>
                    <rect x="10" y="30" width="10" height="10"/>
                    <rect x="30" y="30" width="10" height="10"/>
                    <rect x="70" y="30" width="10" height="10"/>
                    <rect x="90" y="30" width="10" height="10"/>
                    <rect x="10" y="50" width="10" height="10"/>
                    <rect x="50" y="50" width="10" height="10"/>
                    <rect x="70" y="50" width="10" height="10"/>
                    <rect x="110" y="50" width="10" height="10"/>
                    <rect x="30" y="70" width="10" height="10"/>
                    <rect x="50" y="70" width="10" height="10"/>
                    <rect x="90" y="70" width="10" height="10"/>
                    <rect x="110" y="70" width="10" height="10"/>
                    <rect x="10" y="90" width="10" height="10"/>
                    <rect x="30" y="90" width="10" height="10"/>
                    <rect x="70" y="90" width="10" height="10"/>
                    <rect x="90" y="90" width="10" height="10"/>
                    <rect x="110" y="90" width="10" height="10"/>
                    <rect x="10" y="110" width="10" height="10"/>
                    <rect x="50" y="110" width="10" height="10"/>
                    <rect x="70" y="110" width="10" height="10"/>
                    <rect x="90" y="110" width="10" height="10"/>
                </g>
                <text x="60" y="135" text-anchor="middle" font-family="monospace" font-size="8" fill="black">${qrContent}</text>
            </svg>
        `)}`;
    };

    const handleGoHome = () => {
        // Clear any remaining session data
        sessionStorage.removeItem("demoOrderData");
        navigate("/");
    };

    const handleBookMore = () => {
        // Clear session data and go to tickets page
        sessionStorage.removeItem("demoOrderData");
        navigate("/tickets");
    };

    if (!orderData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black text-white mt-10">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

            {/* Content */}
            <div className="relative pt-24 pb-24">
                <div className="max-w-fit mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Success Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-10 h-10 text-white" />
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl font-medium mb-4 text-blue-400 tracking-wide">
                            Booking Confirmed!
                        </h1>
                        <p className="text-xl text-white/60 mb-2">
                            Your tickets have been successfully booked
                        </p>

                        {/* Email Status */}
                        <div
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                                emailSent
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}
                        >
                            {emailSent ? (
                                <>
                                    <MailCheck className="w-5 h-5" />
                                    <span>
                                        Tickets sent to{" "}
                                        {orderData.ticketHolders[0].email}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                    <span>
                                        Sending tickets to{" "}
                                        {orderData.ticketHolders[0].email}...
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Event & Order Details */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Event Information */}
                            <div className="relative overflow-hidden rounded-3xl">
                                {/* Background blur effect with enhanced gradient */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                {/* Enhanced ambient glow effects */}
                                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />
                                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />

                                {/* Content */}
                                <div className="relative p-8">
                                    <h2 className="text-2xl font-medium text-white mb-6 tracking-wide">
                                        Event Details
                                    </h2>

                                    <h3 className="text-xl font-medium text-white mb-4">
                                        {orderData.eventDetails.name}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/60">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">
                                                    Date
                                                </p>
                                                <p className="font-semibold">
                                                    {
                                                        orderData.eventDetails.date.split(
                                                            "T"
                                                        )[0]
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">
                                                    Time
                                                </p>
                                                <p className="font-semibold">
                                                    {
                                                        orderData.eventDetails
                                                            .time
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">
                                                    Venue
                                                </p>
                                                <p className="font-semibold">
                                                    {
                                                        orderData.eventDetails
                                                            .venue
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Details */}
                            <div className="relative overflow-hidden rounded-3xl">
                                {/* Background blur effect with enhanced gradient */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                {/* Enhanced ambient glow effects */}
                                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />
                                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />

                                {/* Content */}
                                <div className="relative p-8">
                                    <h2 className="text-2xl text-white mb-6 flex items-center gap-2 font-medium tracking-wide">
                                        <Ticket className="w-6 h-6" />
                                        Your Tickets ({orderData.seats.length})
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {orderData.seats.map((seat, index) => (
                                            <motion.div
                                                key={seat.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.1 * index,
                                                }}
                                                className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/5"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                                                                <span className="text-blue-400 text-xs">
                                                                    🪑
                                                                </span>
                                                            </div>
                                                            <h4 className="text-white font-medium">
                                                                {formatSeatDisplay(
                                                                    seat.label
                                                                )}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300">
                                                                {seat.category}
                                                            </span>
                                                            <span className="text-blue-400 text-xs">
                                                                {
                                                                    seat.ticketType
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-blue-400 ml-5">
                                                        ${seat.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Order Summary & Customer Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="lg:col-span-1.5 space-y-6"
                        >
                            {/* Order Summary */}
                            <div className="relative overflow-hidden rounded-3xl sticky top-24">
                                {/* Background blur effect with enhanced gradient */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl border border-white/10" />

                                {/* Enhanced ambient glow effects */}
                                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />
                                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />

                                {/* Content */}
                                <div className="relative p-8">
                                    <h3 className="text-xl font-bold text-white mb-4">
                                        Order Summary
                                    </h3>

                                    <div className="space-y-3 mb-4">
                                        {orderData.seats.map((seat, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 border-b border-gray-700/30 last:border-b-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-blue-500/20 rounded flex items-center justify-center">
                                                        <span className="text-blue-400 text-xs">
                                                            🪑
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-300 text-sm">
                                                        {formatSeatDisplay(
                                                            seat.label
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="text-white font-medium">
                                                    ${seat.price.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-600 pt-3">
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="text-white">
                                                Total Paid
                                            </span>
                                            <span className="text-blue-400">
                                                $
                                                {orderData.totalAmount.toFixed(
                                                    2
                                                )}{" "}
                                                {orderData.currency}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="mt-6 pt-6 border-t border-gray-600">
                                        <h4 className="font-semibold mb-3 text-white">
                                            Customer Details
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-400">
                                                    Name:{" "}
                                                </span>
                                                <span className="text-white">
                                                    {
                                                        orderData
                                                            .ticketHolders[0]
                                                            .fullName
                                                    }
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">
                                                    Email:{" "}
                                                </span>
                                                <span className="text-white">
                                                    {
                                                        orderData
                                                            .ticketHolders[0]
                                                            .email
                                                    }
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">
                                                    Phone:{" "}
                                                </span>
                                                <span className="text-white">
                                                    {
                                                        orderData
                                                            .ticketHolders[0]
                                                            .phone
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Email Instructions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 bg-blue-400/10 border border-blue-400/20 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Email Delivery Information
                        </h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li>
                                • Your tickets have been sent to:{" "}
                                <span className="text-white font-semibold">
                                    {orderData.ticketHolders[0].email}
                                </span>
                            </li>
                            <li>
                                • Check your inbox and spam folder for the
                                ticket email
                            </li>
                            <li>
                                • The email contains QR codes for venue entry
                            </li>
                            <li>
                                • Screenshots of QR codes are accepted at the
                                gate
                            </li>
                            <li>
                                • If you don't receive the email within 10
                                minutes, use "Resend Email" button
                            </li>
                        </ul>
                    </motion.div>

                    {/* Important Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 bg-blue-400/10 border border-blue-400/20 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">
                            Important Information
                        </h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li>
                                • Please arrive at least 30 minutes before the
                                event start time
                            </li>
                            <li>
                                • Bring a valid ID matching the name on your
                                ticket
                            </li>
                            <li>
                                • Present QR codes from your email at the venue
                                entrance
                            </li>
                            <li>
                                • Tickets are non-refundable and
                                non-transferable
                            </li>
                            <li>
                                • For assistance, contact support at
                                tickets@unitycup.com
                            </li>
                        </ul>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
                    >
                        <button
                            onClick={handleBookMore}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all"
                        >
                            <Users className="w-5 h-5" />
                            Book More Tickets
                        </button>

                        <button
                            onClick={handleGoHome}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </button>
                    </motion.div>
                </div>

                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            </div>
        </div>
    );
};

export default DemoSuccess;
