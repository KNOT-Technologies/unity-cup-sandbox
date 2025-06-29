import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, AlertCircle, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";

// Paymob Pixel SDK types
interface PaymentResponse {
    transaction?: {
        id?: string;
    };
}

interface PaymentError {
    message?: string;
    code?: string;
}

interface PixelInstance {
    destroy?: () => void;
}

interface PixelConfig {
    publicKey: string;
    clientSecret: string;
    paymentMethods: string[];
    showSaveCard: boolean;
    elementId: string;
    onSuccess: (response: PaymentResponse) => void;
    onError: (error: PaymentError) => void;
}

interface PixelSDK {
    new (config: PixelConfig): PixelInstance;
}

declare global {
    interface Window {
        Pixel?: PixelSDK;
    }
}

interface PaymentData {
    clientSecret: string;
    publicKey: string;
    total: {
        amount: number;
        currency: string;
    };
    email: string;
    userName: string;
}

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toasts, removeToast, showError, showSuccess } = useToast();

    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pixelRef = useRef<PixelInstance | null>(null);

    useEffect(() => {
        // Get payment data from location state or sessionStorage
        const data =
            location.state?.paymentData ||
            JSON.parse(sessionStorage.getItem("paymentData") || "null");

        if (data) {
            setPaymentData(data);
            // Store in sessionStorage as backup
            sessionStorage.setItem("paymentData", JSON.stringify(data));
        } else {
            // No payment data found, redirect back to checkout
            showError("Payment session expired. Please try again.");
            setTimeout(() => navigate("/checkout"), 2000);
            return;
        }

        setLoading(false);
    }, [location.state, navigate, showError]);

    // Initialize Paymob Pixel when payment data is available
    useEffect(() => {
        if (!paymentData || loading) return;

        const waitForPixel = () => {
            const container = document.getElementById("paymob-elements");

            if (typeof window !== "undefined" && window.Pixel && container) {
                if (!pixelRef.current) {
                    try {
                        pixelRef.current = new window.Pixel({
                            publicKey: paymentData.publicKey,
                            clientSecret: paymentData.clientSecret,
                            paymentMethods: ["card"],
                            showSaveCard: true,
                            elementId: "paymob-elements",
                            onSuccess: (response: PaymentResponse) => {
                                const paymentId =
                                    response?.transaction?.id ||
                                    Math.random().toString(36).substring(2, 15);
                                handlePaymentSuccess(paymentId);
                            },
                            onError: (error: PaymentError) => {
                                console.error("Payment error:", error);
                                setError("Payment failed. Please try again.");
                            },
                        });
                    } catch (error) {
                        console.error("Error initializing Pixel:", error);
                        setError(
                            "Payment system initialization failed. Please try again."
                        );
                    }
                }
            } else {
                setTimeout(waitForPixel, 100);
            }
        };

        const initTimeout = setTimeout(waitForPixel, 100);

        return () => {
            clearTimeout(initTimeout);

            if (
                pixelRef.current &&
                typeof pixelRef.current.destroy === "function"
            ) {
                try {
                    pixelRef.current.destroy();
                } catch (error) {
                    console.warn("Error destroying Pixel instance:", error);
                }
            }
            pixelRef.current = null;
        };
    }, [paymentData, loading]);

    const handlePaymentSuccess = (paymentId: string) => {
        // Clean up payment data
        sessionStorage.removeItem("paymentData");
        sessionStorage.removeItem("currentQuote");
        sessionStorage.removeItem("selectedAddons");

        showSuccess("Payment successful! Redirecting...");
        setTimeout(() => navigate(`/success/${paymentId}`), 1000);
    };

    const handleGoBack = () => {
        // Keep payment data in case user wants to try again
        navigate("/checkout");
    };

    const currency = paymentData?.total.currency === "USD" ? "$" : "EGP";

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-white/60">Loading payment form...</div>
                </div>
            </div>
        );
    }

    if (!paymentData) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <div className="text-white/60">Payment session expired</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleGoBack}
                    className="flex items-center space-x-2 text-white/60 hover:text-amber-400 
                    transition-colors duration-300 mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Back to Checkout</span>
                </motion.button>

                {/* Payment Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 p-8"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-full p-4 w-16 h-16 mx-auto mb-4 border border-amber-500/20">
                            <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                        </div>
                        <h1 className="text-2xl font-medium text-white mb-2">
                            Secure Payment
                        </h1>
                        <p className="text-white/60">
                            Complete your booking with encrypted card payment
                        </p>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-900/30 rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">
                                Payment Details
                            </h3>
                            <Lock className="w-5 h-5 text-green-400" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Customer</span>
                                <span className="text-white">
                                    {paymentData.userName
                                        .split(",")[0]
                                        ?.trim() || paymentData.userName}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Email</span>
                                <span className="text-white">
                                    {paymentData.email.split(",")[0]?.trim() ||
                                        paymentData.email}
                                </span>
                            </div>
                            <div className="border-t border-gray-700/30 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-lg font-medium text-white">
                                        Total Amount
                                    </span>
                                    <span className="text-lg font-medium text-amber-400">
                                        {currency} {paymentData.total.amount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-red-400 font-medium">
                                    Payment Error
                                </p>
                                <p className="text-red-400/80 text-sm">
                                    {error}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Payment Form Container */}
                    <div className="bg-gray-900/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-medium text-white">
                                Card Details
                            </h3>
                        </div>

                        {/* Paymob Pixel Container */}
                        <div
                            id="paymob-elements"
                            className="w-full min-h-[200px]"
                        >
                            {!pixelRef.current && (
                                <div className="flex items-center justify-center h-48">
                                    <div className="text-center">
                                        <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-white/60">
                                            Loading payment form...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Lock className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-green-400 font-medium text-sm">
                                    Secure Payment
                                </p>
                                <p className="text-green-400/80 text-sm">
                                    Your payment information is encrypted and
                                    processed securely by Paymob
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPage;
