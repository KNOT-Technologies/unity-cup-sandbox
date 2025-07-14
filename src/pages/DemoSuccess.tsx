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

    const handleResendEmail = async () => {
        if (!orderData) return;

        try {
            // Simulate email resending
            await new Promise((resolve) => setTimeout(resolve, 1000));
            showSuccess(
                `Tickets resent to ${orderData.ticketHolders[0].email}`
            );
        } catch {
            showError("Failed to resend email. Please try again.");
        }
    };

    const handleShareTickets = () => {
        if (!orderData) return;

        if (navigator.share) {
            navigator.share({
                title: `${orderData.eventDetails.name} Tickets`,
                text: `I just booked tickets for ${orderData.eventDetails.name}! Order #${orderData.orderId}`,
                url: window.location.href,
            });
        } else {
            // Fallback for browsers without Web Share API
            navigator.clipboard.writeText(
                `🎫 Just booked tickets for ${orderData.eventDetails.name}! Order #${orderData.orderId}`
            );
            showSuccess("Ticket details copied to clipboard!");
        }
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Booking Confirmed!
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">
                        Your tickets have been successfully booked
                    </p>
                    <p className="text-lg text-amber-400 font-semibold mb-4">
                        Order #{orderData.orderId}
                    </p>

                    {/* Email Status */}
                    <div
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                            emailSent
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
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
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold text-amber-400 mb-6">
                                Event Details
                            </h2>

                            <h3 className="text-xl font-bold text-white mb-4">
                                {orderData.eventDetails.name}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Date
                                        </p>
                                        <p className="font-semibold">
                                            {orderData.eventDetails.date}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Time
                                        </p>
                                        <p className="font-semibold">
                                            {orderData.eventDetails.time}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Venue
                                        </p>
                                        <p className="font-semibold">
                                            {orderData.eventDetails.venue}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Details */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl text-amber-400 mb-6 flex items-center gap-2">
                                <Ticket className="w-6 h-6" />
                                Your Tickets ({orderData.seats.length})
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {orderData.seats.map((seat, index) => (
                                    <motion.div
                                        key={seat.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className=" text-white">
                                                    Seat {seat.label}
                                                </h4>
                                                <p className="text-sm text-gray-400">
                                                    {seat.category} •{" "}
                                                    {seat.ticketType}
                                                </p>
                                            </div>
                                            <span className="text-amber-400 ">
                                                ${seat.price.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* QR Code */}
                                        <div className="flex items-center justify-center bg-white p-3 rounded-lg">
                                            <img
                                                src={generateQRCode(
                                                    seat.id,
                                                    orderData.orderId,
                                                    orderData.tickets?.find(
                                                        (t) =>
                                                            t.seatLabel ===
                                                            seat.label
                                                    )?.qrCode
                                                )}
                                                alt={`QR Code for seat ${seat.label}`}
                                                className="w-24 h-24"
                                            />
                                        </div>

                                        <div className="mt-3 text-center">
                                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                                <QrCode className="w-3 h-3" />
                                                Scan at venue entrance
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Order Summary & Customer Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Order Summary */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50 sticky top-24">
                            <h3 className="text-xl font-bold text-amber-400 mb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3 mb-4">
                                {orderData.seats.map((seat, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-gray-300">
                                            Seat {seat.label}
                                        </span>
                                        <span className="text-white">
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
                                    <span className="text-green-400">
                                        ${orderData.totalAmount.toFixed(2)}{" "}
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
                                                orderData.ticketHolders[0]
                                                    .fullName
                                            }
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">
                                            Email:{" "}
                                        </span>
                                        <span className="text-white">
                                            {orderData.ticketHolders[0].email}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">
                                            Phone:{" "}
                                        </span>
                                        <span className="text-white">
                                            {orderData.ticketHolders[0].phone}
                                        </span>
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
                    <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
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
                            • Check your inbox and spam folder for the ticket
                            email
                        </li>
                        <li>• The email contains QR codes for venue entry</li>
                        <li>
                            • Screenshots of QR codes are accepted at the gate
                        </li>
                        <li>
                            • If you don't receive the email within 10 minutes,
                            use "Resend Email" button
                        </li>
                    </ul>
                </motion.div>

                {/* Important Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 bg-amber-400/10 border border-amber-400/20 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-amber-400 mb-4">
                        Important Information
                    </h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li>
                            • Please arrive at least 30 minutes before the event
                            start time
                        </li>
                        <li>
                            • Bring a valid ID matching the name on your ticket
                        </li>
                        <li>
                            • Present QR codes from your email at the venue
                            entrance
                        </li>
                        <li>
                            • Tickets are non-refundable and non-transferable
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
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all"
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
    );
};

export default DemoSuccess;
