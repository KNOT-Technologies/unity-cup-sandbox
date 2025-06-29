import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle,
    ArrowLeft,
    Coins,
    CreditCard,
    TrendingUp,
    Calendar,
    Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const CreditPurchaseSuccess = () => {
    const navigate = useNavigate();
    const { paymentId } = useParams<{ paymentId: string }>();
    const [customerName, setCustomerName] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [currency, setCurrency] = useState("USD");
    const [creditsAmount, setCreditsAmount] = useState(0);

    useEffect(() => {
        // Get customer information from session storage or payment data
        const paymentData = sessionStorage.getItem("paymentData");
        if (paymentData) {
            try {
                const data = JSON.parse(paymentData);
                const firstName = (data.userName || "").split(",")[0] || "";

                setCustomerName(firstName.trim());
                setTotalAmount(data.total?.amount || 0);
                setCurrency(data.total?.currency || "USD");
                setCreditsAmount(data.creditsAmount || 0);
            } catch (error) {
                console.error("Error parsing payment data:", error);
            }
        }

        // Clean up session storage
        sessionStorage.removeItem("paymentData");
    }, []);

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
                        <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-full blur-xl opacity-50"></div>
                        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full p-6 relative backdrop-blur-xl border border-emerald-500/20">
                            <CheckCircle className="w-16 h-16 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent mb-4">
                        Credit Purchase Successful!
                    </h1>
                    <p className="text-white/60 text-lg mb-2">
                        Thank you for your credit purchase, {customerName}
                    </p>
                    {paymentId && (
                        <p className="text-white/40 text-sm">
                            Payment ID: {paymentId}
                        </p>
                    )}
                </motion.div>

                {/* Credit Purchase Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 p-8 mb-8"
                >
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-3 w-fit mx-auto mb-4 border border-amber-500/20">
                            <Coins className="w-8 h-8 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-medium text-white mb-4">
                            Credits Added to Your Account
                        </h2>
                        <div className="bg-gray-900/30 rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Credits Purchased</span>
                                <span className="text-3xl font-bold text-amber-400">
                                    {creditsAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Total Paid</span>
                                <span className="text-2xl font-medium text-emerald-400">
                                    {currency} {totalAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Price per Credit</span>
                                <span className="text-white">
                                    {currency} {(totalAmount / creditsAmount).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Account</span>
                                <span className="text-white">
                                    {customerName}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Credit Balance Update */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-8"
                >
                    <div className="text-center">
                        <div className="bg-emerald-500/20 rounded-full p-4 w-fit mx-auto mb-4">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-4">
                            Your Credit Balance Has Been Updated
                        </h3>
                        <p className="text-emerald-200 mb-4">
                            Your new credits are now available for booking tickets
                        </p>
                        <div className="bg-emerald-500/10 rounded-lg p-4 mb-4">
                            <p className="text-emerald-300 font-medium text-lg">
                                +{creditsAmount.toLocaleString()} Credits Added
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-emerald-200/80 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Credits are immediately available for use</span>
                        </div>
                    </div>
                </motion.div>

                {/* What You Can Do Now */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 p-8 mb-8"
                >
                    <h3 className="text-lg font-medium text-white mb-6 text-center">
                        What You Can Do Now
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
                                <CreditCard className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">
                                    1. Book Tickets with Credits
                                </h4>
                                <p className="text-white/60 text-sm">
                                    Use your credits to book tickets for events without additional payment
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
                                <Coins className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">
                                    2. Check Your Balance
                                </h4>
                                <p className="text-white/60 text-sm">
                                    Monitor your credit balance in the business portal dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
                                <Plus className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">
                                    3. Purchase More Credits
                                </h4>
                                <p className="text-white/60 text-sm">
                                    Buy additional credits anytime from the credits section
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Credit Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 mb-8"
                >
                    <h3 className="text-lg font-medium text-white mb-6 text-center">
                        Benefits of Using Credits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                            <h4 className="text-amber-400 font-medium mb-2">Instant Booking</h4>
                            <p className="text-amber-200/80 text-sm">
                                Book tickets immediately without payment processing delays
                            </p>
                        </div>
                        <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                            <h4 className="text-amber-400 font-medium mb-2">Bulk Discounts</h4>
                            <p className="text-amber-200/80 text-sm">
                                Save money with volume discounts on credit purchases
                            </p>
                        </div>
                        <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                            <h4 className="text-amber-400 font-medium mb-2">Easy Management</h4>
                            <p className="text-amber-200/80 text-sm">
                                Track all your bookings and credit usage in one place
                            </p>
                        </div>
                        <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                            <h4 className="text-amber-400 font-medium mb-2">Flexible Usage</h4>
                            <p className="text-amber-200/80 text-sm">
                                Use credits for any event or ticket type available
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Support Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-900/30 rounded-xl p-6 text-center mb-8"
                >
                    <p className="text-white/60 text-sm mb-2">
                        Need help with your credits or bookings?
                    </p>
                    <p className="text-white/80 text-sm">
                        Contact our business support team for assistance
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={() => navigate("/business")}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <button
                        onClick={() => navigate("/business/bookings")}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Book Tickets Now
                    </button>

                    <button
                        onClick={() => navigate("/business/credits")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Buy More Credits
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default CreditPurchaseSuccess; 