import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle,
    ArrowLeft,
    Mail,
    Clock,
    Smartphone,
    Shield,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";


const PurchaseSuccess = () => {
    const navigate = useNavigate();
    const { paymentId } = useParams<{ paymentId: string }>();
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [currency, setCurrency] = useState("USD");

    useEffect(() => {
        // Get customer information from session storage or payment data
        const paymentData = sessionStorage.getItem("paymentData");
        if (paymentData) {
            try {
                const data = JSON.parse(paymentData);
                const firstEmail = (data.email || "").split(",")[0] || "";
                const firstName = (data.userName || "").split(",")[0] || "";

                setCustomerEmail(firstEmail.trim());
                setCustomerName(firstName.trim());
                setTotalAmount(data.total?.amount || 0);
                setCurrency(data.total?.currency || "USD");
            } catch (error) {
                console.error("Error parsing payment data:", error);
            }
        }

        // Clean up session storage
        sessionStorage.removeItem("paymentData");
        sessionStorage.removeItem("currentQuote");
        sessionStorage.removeItem("selectedAddons");
    }, []);

    const currencySymbol = currency === "USD" ? "$" : "EGP";

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block relative mb-6">
                        <div className="absolute -inset-6 bg-gradient-to-r from-green-500/30 to-green-500/0 rounded-full blur-xl opacity-50"></div>
                        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full p-6 relative backdrop-blur-xl border border-green-500/20">
                            <CheckCircle className="w-16 h-16 text-green-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent mb-4">
                        Payment Successful!
                    </h1>
                    <p className="text-white/60 text-lg mb-2">
                        Thank you for your purchase, {customerName}
                    </p>
                    {paymentId && (
                        <p className="text-white/40 text-sm">
                            Payment ID: {paymentId}
                        </p>
                    )}
                </motion.div>

                {/* Payment Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 p-8 mb-8"
                >
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-3 w-fit mx-auto mb-4 border border-amber-500/20">
                            <Shield className="w-8 h-8 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-medium text-white mb-4">
                            Booking Confirmed
                        </h2>
                        <div className="bg-gray-900/30 rounded-xl p-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">
                                    Total Paid
                                </span>
                                <span className="text-2xl font-medium text-green-400">
                                    {currencySymbol}
                                    {totalAmount}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Customer</span>
                                <span className="text-white">
                                    {customerName}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Email</span>
                                <span className="text-white">
                                    {customerEmail}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Email Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 mb-8"
                >
                    <div className="text-center">
                        <div className="bg-blue-500/20 rounded-full p-4 w-fit mx-auto mb-4">
                            <Mail className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-4">
                            Check Your Email
                        </h3>
                        <p className="text-blue-200 mb-4">
                            Your tickets are being processed and will be sent
                            to:
                        </p>
                        <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
                            <p className="text-blue-300 font-medium text-lg">
                                {customerEmail}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-blue-200/80 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Usually delivered within 5-10 minutes</span>
                        </div>
                    </div>
                </motion.div>

                {/* What to Expect */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 p-8 mb-8"
                >
                    <h3 className="text-lg font-medium text-white mb-6 text-center">
                        What's Next?
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
                                <Mail className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">
                                    1. Receive Your Tickets
                                </h4>
                                <p className="text-white/60 text-sm">
                                    Digital tickets with QR codes will be sent
                                    to your email address
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
                                <Smartphone className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">
                                    2. Save to Your Phone
                                </h4>
                                <p className="text-white/60 text-sm">
                                    Download the tickets to your phone
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">
                                    3. Show at Entry
                                </h4>
                                <p className="text-white/60 text-sm">
                                    Present your QR code at the venue entrance
                                    for scanning
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Support Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-900/30 rounded-xl p-6 text-center mb-8"
                >
                    <p className="text-white/60 text-sm mb-2">
                        Haven't received your tickets after 15 minutes?
                    </p>
                    <p className="text-white/80 text-sm">
                        Check your spam folder or contact our support team
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>

                    <button
                        onClick={() => navigate("/tickets")}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Book More Tickets
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default PurchaseSuccess;
