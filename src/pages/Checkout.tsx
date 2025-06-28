import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, AlertCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { processCheckout } from "../api/knot";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";
import type { QuoteData, AddonSelection } from "../types/tickets";

const Checkout = () => {
    const navigate = useNavigate();
    const { toasts, removeToast, showError } = useToast();

    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [nationality, setNationality] = useState("");
    const [addons, setAddons] = useState<AddonSelection[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        // Get quote from sessionStorage
        const storedQuote = sessionStorage.getItem("currentQuote");
        if (storedQuote) {
            const quoteData = JSON.parse(storedQuote);
            setQuote(quoteData);

            // Calculate time remaining
            const expiresAt = new Date(quoteData.expiresAt).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
            setTimeRemaining(remaining);
        } else {
            // No quote found, redirect to tickets
            navigate("/tickets");
        }

        // Get stored addons if any
        const storedAddons = sessionStorage.getItem("selectedAddons");
        if (storedAddons) {
            setAddons(JSON.parse(storedAddons));
        }
    }, [navigate]);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    // Quote expired
                    showError(
                        "Your seat hold has expired. Please select seats again."
                    );
                    setTimeout(() => navigate("/tickets"), 2000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, navigate, showError]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const getTimeColor = (seconds: number) => {
        if (seconds > 60) return "text-green-400";
        if (seconds > 30) return "text-yellow-400";
        return "text-red-400";
    };

    const calculateAddonTotal = () => {
        // This would be calculated based on real addon data
        // For now, using a placeholder
        return addons.length * 50; // $50 per addon
    };

    const calculateTotal = () => {
        if (!quote) return 0;
        return quote.total.amount + calculateAddonTotal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !quote ||
            !email.trim() ||
            !userName.trim() ||
            !dateOfBirth.trim() ||
            !nationality.trim()
        ) {
            setError("Please fill in all required fields");
            return;
        }

        if (timeRemaining < 5) {
            showError("Not enough time remaining. Please select seats again.");
            setTimeout(() => navigate("/tickets"), 1000);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const checkoutResponse = await processCheckout({
                quoteId: quote.quoteId,
                paymentMethod: "card",
                email: email.trim(),
                userName: userName.trim(),
                dateOfBirth: dateOfBirth.trim(),
                nationality: nationality.trim(),
                redirectionUrl: `${window.location.origin}/success`,
                addons: addons.length > 0 ? addons : undefined,
            });

            // Navigate to payment page with credentials
            navigate("/payment", {
                state: {
                    paymentData: {
                        clientSecret: checkoutResponse.clientSecret,
                        publicKey: checkoutResponse.publicKey,
                        total: {
                            amount: calculateTotal(),
                            currency: quote.total.currency,
                        },
                        email: email.trim(),
                        userName: userName.trim(),
                        dateOfBirth: dateOfBirth.trim(),
                        nationality: nationality.trim(),
                    },
                },
            });
        } catch (err: unknown) {
            const error = err as { error?: string };
            if (error.error === "QUOTE_EXPIRED") {
                showError(
                    "Your seat hold has expired. Please select seats again."
                );
                setTimeout(() => navigate("/tickets"), 2000);
            } else {
                setError(error.error || "Checkout failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const currency = quote?.total.currency === "USD" ? "$" : "EGP";

    if (!quote) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white/60 mb-4">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate("/tickets")}
                    className="flex items-center space-x-2 text-white/60 hover:text-amber-400 
            transition-colors duration-300 mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Back to Seat Selection</span>
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Checkout Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 border border-amber-500/20">
                                <CreditCard className="w-5 h-5 text-amber-400" />
                            </div>
                            <h1 className="text-xl font-medium text-white">
                                Checkout
                            </h1>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-red-400 font-medium">
                                        Error
                                    </p>
                                    <p className="text-red-400/80 text-sm">
                                        {error}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) =>
                                        setUserName(e.target.value)
                                    }
                                    className="w-full bg-gray-800/30 border border-gray-700/30 rounded-lg px-4 py-3
                    text-white placeholder-white/40 focus:outline-none focus:ring-2 
                    focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                                    placeholder="John Smith"
                                    required
                                />
                                <p className="text-sm text-white/40 mt-2">
                                    Name that will appear on your tickets
                                </p>
                            </div>

                            {/* Date of Birth Input */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) =>
                                        setDateOfBirth(e.target.value)
                                    }
                                    className="w-full bg-gray-800/30 border border-gray-700/30 rounded-lg px-4 py-3
                    text-white placeholder-white/40 focus:outline-none focus:ring-2 
                    focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                                    required
                                />
                                <p className="text-sm text-white/40 mt-2">
                                    Required for ticket validation
                                </p>
                            </div>

                            {/* Nationality Input */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Nationality
                                </label>
                                <select
                                    value={nationality}
                                    onChange={(e) =>
                                        setNationality(e.target.value)
                                    }
                                    className="w-full bg-gray-800/30 border border-gray-700/30 rounded-lg px-4 py-3
                    text-white focus:outline-none focus:ring-2 
                    focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                                    required
                                >
                                    <option value="" className="bg-gray-800">
                                        Select your nationality
                                    </option>
                                    <option
                                        value="Egyptian"
                                        className="bg-gray-800"
                                    >
                                        Egyptian
                                    </option>
                                    <option
                                        value="American"
                                        className="bg-gray-800"
                                    >
                                        American
                                    </option>
                                    <option
                                        value="British"
                                        className="bg-gray-800"
                                    >
                                        British
                                    </option>
                                    <option
                                        value="Canadian"
                                        className="bg-gray-800"
                                    >
                                        Canadian
                                    </option>
                                    <option
                                        value="French"
                                        className="bg-gray-800"
                                    >
                                        French
                                    </option>
                                    <option
                                        value="German"
                                        className="bg-gray-800"
                                    >
                                        German
                                    </option>
                                    <option
                                        value="Italian"
                                        className="bg-gray-800"
                                    >
                                        Italian
                                    </option>
                                    <option
                                        value="Spanish"
                                        className="bg-gray-800"
                                    >
                                        Spanish
                                    </option>
                                    <option
                                        value="Australian"
                                        className="bg-gray-800"
                                    >
                                        Australian
                                    </option>
                                    <option
                                        value="Japanese"
                                        className="bg-gray-800"
                                    >
                                        Japanese
                                    </option>
                                    <option
                                        value="Chinese"
                                        className="bg-gray-800"
                                    >
                                        Chinese
                                    </option>
                                    <option
                                        value="Indian"
                                        className="bg-gray-800"
                                    >
                                        Indian
                                    </option>
                                    <option
                                        value="Brazilian"
                                        className="bg-gray-800"
                                    >
                                        Brazilian
                                    </option>
                                    <option
                                        value="Mexican"
                                        className="bg-gray-800"
                                    >
                                        Mexican
                                    </option>
                                    <option
                                        value="Russian"
                                        className="bg-gray-800"
                                    >
                                        Russian
                                    </option>
                                    <option
                                        value="Saudi Arabian"
                                        className="bg-gray-800"
                                    >
                                        Saudi Arabian
                                    </option>
                                    <option
                                        value="Emirati"
                                        className="bg-gray-800"
                                    >
                                        Emirati
                                    </option>
                                    <option
                                        value="Lebanese"
                                        className="bg-gray-800"
                                    >
                                        Lebanese
                                    </option>
                                    <option
                                        value="Jordanian"
                                        className="bg-gray-800"
                                    >
                                        Jordanian
                                    </option>
                                    <option
                                        value="Other"
                                        className="bg-gray-800"
                                    >
                                        Other
                                    </option>
                                </select>
                                <p className="text-sm text-white/40 mt-2">
                                    Required for entry documentation
                                </p>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-800/30 border border-gray-700/30 rounded-lg px-4 py-3
                    text-white placeholder-white/40 focus:outline-none focus:ring-2 
                    focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                                    placeholder="your@email.com"
                                    required
                                />
                                <p className="text-sm text-white/40 mt-2">
                                    Your tickets will be sent to this email
                                    address
                                </p>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Payment Method
                                </label>
                                <div className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-amber-400" />
                                        <div>
                                            <p className="text-white font-medium">
                                                Credit Card
                                            </p>
                                            <p className="text-white/60 text-sm">
                                                Secure payment via Paymob
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || timeRemaining < 5}
                                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 
                  disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg 
                  transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pay with Card
                                    </>
                                )}
                            </button>

                            {timeRemaining < 30 && timeRemaining > 0 && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-yellow-400 text-sm">
                                        ⚠️ Your seat hold expires in{" "}
                                        {formatTime(timeRemaining)}
                                    </p>
                                </div>
                            )}
                        </form>
                    </motion.div>

                    {/* Right Column - Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-medium text-white">
                                Order Summary
                            </h2>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span
                                    className={`text-sm font-mono ${getTimeColor(
                                        timeRemaining
                                    )}`}
                                >
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Quote Lines */}
                            {quote.lines.map((line, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between text-sm"
                                >
                                    <span className="text-white/80">
                                        {line.label}
                                    </span>
                                    <span className="text-white">
                                        {currency} {line.amount}
                                    </span>
                                </div>
                            ))}

                            {/* Add-ons */}
                            {addons.length > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">
                                        Translation Headphones ({addons.length})
                                    </span>
                                    <span className="text-white">
                                        {currency} {calculateAddonTotal()}
                                    </span>
                                </div>
                            )}

                            <div className="border-t border-gray-700/30 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-lg font-medium text-white">
                                        Total
                                    </span>
                                    <span className="text-lg font-medium text-amber-400">
                                        {currency} {calculateTotal()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
