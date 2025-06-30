import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    ArrowLeft,
    AlertCircle,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { processCheckout, updateQuote, type QuoteRequest } from "../api/knot";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";
import type { QuoteData, SeatSelection } from "../types/tickets";

interface AddonWithPrice {
    seat: string;
    addonId: string;
    optionCode: string;
    addonName?: string;
    optionLabel?: string;
    price?: {
        EGP: number;
        USD: number;
    };
}

// New: Ticket holder details interface
interface TicketHolder {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    email: string;
    open: boolean; // for accordion
}

// New: Validation errors interface
interface ValidationErrors {
    [ticketIndex: number]: {
        fullName?: string;
        dateOfBirth?: string;
        nationality?: string;
        email?: string;
    };
}

const NATIONALITIES = [
    "Egyptian",
    "American",
    "British",
    "Canadian",
    "French",
    "German",
    "Italian",
    "Spanish",
    "Australian",
    "Japanese",
    "Chinese",
    "Indian",
    "Brazilian",
    "Mexican",
    "Russian",
    "Saudi Arabian",
    "Emirati",
    "Lebanese",
    "Jordanian",
    "Other",
];

const Checkout = () => {
    const navigate = useNavigate();
    const { toasts, removeToast, showError } = useToast();

    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [addons, setAddons] = useState<AddonWithPrice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [seatSelections, setSeatSelections] = useState<SeatSelection[]>([]);
    // New: ticket holders state
    const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]);
    // New: validation errors state
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {}
    );
    // Promo code state
    const appliedPromoLine = quote?.lines.find((l) =>
        l.label.startsWith("Promo")
    );
    const [promoCodeInput, setPromoCodeInput] = useState<string>(
        appliedPromoLine
            ? appliedPromoLine.label.split("–")[1]?.split("(")[0]?.trim() || ""
            : ""
    );

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

        // Get stored seat selections if any
        const storedSelections = sessionStorage.getItem("seatSelections");
        if (storedSelections) {
            setSeatSelections(JSON.parse(storedSelections));
        }

        // Clear translation preferences from sessionStorage
        sessionStorage.removeItem("translationPreference");
    }, [navigate]);

    // New: Initialize ticket holders when seatSelections or quote changes
    useEffect(() => {
        const count =
            seatSelections.length > 0
                ? seatSelections.length
                : quote?.lines.length || 0;
        setTicketHolders((prev) => {
            if (prev.length === count) return prev;
            // Fill with empty details, keep previous if possible
            return Array.from(
                { length: count },
                (_, i) =>
                    prev[i] || {
                        fullName: "",
                        dateOfBirth: "",
                        nationality: isTouristPricing() ? "" : "Egyptian",
                        email: "",
                        open: true, // all forms open by default
                    }
            );
        });
    }, [seatSelections, quote]);

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

    // Determine if the user selected tourist or local seats
    const isTouristPricing = () => {
        if (!quote) return false;
        return (
            quote.lines.some((line) =>
                line.label.toLowerCase().includes("tourist")
            ) || quote.total.currency === "USD"
        );
    };

    const calculateAddonTotal = () => {
        // Sum up prices based on the user type (tourist or local)
        const currencyKey = isTouristPricing() ? "USD" : "EGP";

        return addons.reduce((total, addon) => {
            if (addon.price) {
                return total + addon.price[currencyKey];
            }
            // Fallback to fixed price if no price info
            return total + (currencyKey === "USD" ? 3 : 50);
        }, 0);
    };

    const calculateTotal = () => {
        if (quote) {
            // Always trust backend quote total (includes promo discount)
            return quote.total.amount + calculateAddonTotal();
        }

        // Fallback calculation
        const ticketsTotal = seatSelections.reduce(
            (sum, selection) => sum + selection.price,
            0
        );
        return ticketsTotal + calculateAddonTotal();
    };

    // Get the appropriate currency symbol
    const getCurrencySymbol = () => {
        if (!quote) return "£";
        return quote.total.currency === "USD" ? "$" : "£";
    };

    // Helper function to calculate age from date of birth
    const calculateAge = (dateOfBirth: string) => {
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

    // Helper function to get ticket type from index
    const getTicketTypeForIndex = (index: number) => {
        return (
            seatSelections[index]?.ticketType ||
            quote?.lines[index]?.label?.toLowerCase() ||
            ""
        );
    };

    // New: Validation function
    const validateTicketHolders = () => {
        const errors: ValidationErrors = {};
        let hasErrors = false;

        ticketHolders.forEach((holder, index) => {
            const holderErrors: {
                fullName?: string;
                dateOfBirth?: string;
                nationality?: string;
                email?: string;
            } = {};

            // Validate full name
            if (!holder.fullName.trim()) {
                holderErrors.fullName = "Full name is required";
                hasErrors = true;
            }

            // Validate date of birth
            if (!holder.dateOfBirth.trim()) {
                holderErrors.dateOfBirth = "Date of birth is required";
                hasErrors = true;
            } else {
                // Age validation based on ticket type
                const age = calculateAge(holder.dateOfBirth);
                const ticketType = getTicketTypeForIndex(index).toLowerCase();

                if (ticketType.includes("senior")) {
                    console.log(age);
                    if (age < 80) {
                        holderErrors.dateOfBirth =
                            "Senior tickets require age 80 or above";
                        hasErrors = true;
                    }
                } else if (ticketType.includes("adult")) {
                    if (age < 18 || age >= 80) {
                        holderErrors.dateOfBirth =
                            "Adult tickets require age between 18-79";
                        hasErrors = true;
                    }
                } else if (ticketType.includes("student")) {
                    if (age < 16 || age >= 30) {
                        holderErrors.dateOfBirth =
                            "Student tickets require age between 16-29";
                        hasErrors = true;
                    }
                } else if (ticketType.includes("child")) {
                    if (age >= 16) {
                        holderErrors.dateOfBirth =
                            "Child tickets require age under 16";
                        hasErrors = true;
                    }
                }
            }

            // Validate nationality
            if (!holder.nationality.trim()) {
                holderErrors.nationality = "Nationality is required";
                hasErrors = true;
            }

            // Validate email - only for first ticket holder
            if (index === 0) {
                if (!holder.email.trim()) {
                    holderErrors.email = "Email address is required";
                    hasErrors = true;
                } else if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holder.email.trim())
                ) {
                    holderErrors.email = "Please enter a valid email address";
                    hasErrors = true;
                }
            }

            if (Object.keys(holderErrors).length > 0) {
                errors[index] = holderErrors;
            }
        });

        setValidationErrors(errors);
        return !hasErrors;
    };

    // New: Clear validation error for specific field
    const clearValidationError = (
        ticketIndex: number,
        field: keyof Omit<TicketHolder, "open">
    ) => {
        setValidationErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors[ticketIndex]) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [field]: _removed, ...rest } = newErrors[ticketIndex];
                if (Object.keys(rest).length === 0) {
                    delete newErrors[ticketIndex];
                } else {
                    newErrors[ticketIndex] = rest;
                }
            }
            return newErrors;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!quote) {
            setError("Quote not found. Please try again.");
            return;
        }

        // Validate all fields
        if (!validateTicketHolders()) {
            setError("Please fill in all required fields correctly");
            // Auto-open sections with errors
            setTicketHolders((prev) =>
                prev.map((holder, index) => ({
                    ...holder,
                    open: validationErrors[index] ? true : holder.open,
                }))
            );
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
                ticketHolders: ticketHolders.map((holder, index) => ({
                    fullName: holder.fullName.trim(),
                    dateOfBirth: holder.dateOfBirth.trim(),
                    nationality: holder.nationality.trim(),
                    email: index === 0 ? holder.email.trim() : "",
                })),
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
                        email: ticketHolders[0].email.trim(),
                        userName: ticketHolders
                            .map((holder) => holder.fullName.trim())
                            .join(","),
                        dateOfBirth: ticketHolders
                            .map((holder) => holder.dateOfBirth.trim())
                            .join(","),
                        nationality: ticketHolders
                            .map((holder) => holder.nationality.trim())
                            .join(","),
                    },
                },
            });
        } catch (err: unknown) {
            const error = err as { error?: string };
            if (
                error.error === "PROMO_LIMIT_REACHED" ||
                error.error === "PROMO_INVALIDATED"
            ) {
                showError(
                    "Promo code is no longer valid. Please go back and try a different code."
                );
                setTimeout(() => navigate("/tickets"), 3000);
            } else if (error.error === "QUOTE_EXPIRED") {
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

    // Updated: handle ticket holder field change with validation clearing
    const handleTicketHolderChange = (
        idx: number,
        field: keyof TicketHolder,
        value: string | boolean
    ) => {
        setTicketHolders((prev) =>
            prev.map((holder, i) =>
                i === idx ? { ...holder, [field]: value } : holder
            )
        );

        // Clear validation error when user starts typing
        if (typeof value === "string" && value.trim() && field !== "open") {
            clearValidationError(
                idx,
                field as keyof Omit<TicketHolder, "open">
            );
        }
    };

    const handleApplyPromoCode = async () => {
        if (!quote) return;

        try {
            const seats = seatSelections.map((s) => ({
                row: s.seat.row,
                col: s.seat.number,
                category: s.ticketType,
            }));

            const visitor = isTouristPricing() ? "foreign" : "local";

            interface PromoQuoteRequest extends QuoteRequest {
                promoCode?: string;
            }
            const requestBody: PromoQuoteRequest = {
                seats,
                visitor,
                ...(promoCodeInput.trim()
                    ? { promoCode: promoCodeInput.trim() }
                    : {}),
            };

            const updatedQuote = await updateQuote(quote.quoteId, requestBody);

            setQuote(updatedQuote);
            sessionStorage.setItem(
                "currentQuote",
                JSON.stringify(updatedQuote)
            );
            // update applied line
        } catch (err: unknown) {
            const error = err as { error?: string };
            if (error.error === "INVALID_PROMO") {
                showError("Promo code not valid.");
            } else if (error.error === "PROMO_LIMIT_REACHED") {
                showError("Promo code usage limit reached.");
            } else {
                showError(error.error || "Failed to apply promo code.");
            }
        }
    };

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

                        {/* Multiple ticket holder forms */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {ticketHolders.map((holder, idx) => {
                                const ticketType =
                                    seatSelections[idx]?.ticketType ||
                                    quote?.lines[idx]?.label ||
                                    "Ticket";
                                // Nationality logic
                                const tourist = isTouristPricing();
                                const nationalityOptions = tourist
                                    ? NATIONALITIES.filter(
                                          (n) => n !== "Egyptian"
                                      )
                                    : ["Egyptian"];

                                const errors = validationErrors[idx] || {};
                                const hasErrors =
                                    Object.keys(errors).length > 0;

                                return (
                                    <div
                                        key={idx}
                                        className={`mb-4 border rounded-lg ${
                                            hasErrors
                                                ? "border-red-500/50 bg-red-500/5"
                                                : "border-gray-700/30"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className={`w-full flex justify-between items-center px-4 py-3 rounded-t-lg focus:outline-none ${
                                                hasErrors
                                                    ? "bg-red-500/10"
                                                    : "bg-gray-800/40"
                                            }`}
                                            onClick={() =>
                                                handleTicketHolderChange(
                                                    idx,
                                                    "open",
                                                    !holder.open
                                                )
                                            }
                                        >
                                            <span
                                                className={`font-medium ${
                                                    hasErrors
                                                        ? "text-red-400"
                                                        : "text-white/90"
                                                }`}
                                            >
                                                Ticket {idx + 1}: {ticketType}
                                            </span>
                                            {holder.open ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>
                                        {holder.open && (
                                            <div className="p-4 space-y-4">
                                                {/* Full Name Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-white/60 mb-2">
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={holder.fullName}
                                                        onChange={(e) =>
                                                            handleTicketHolderChange(
                                                                idx,
                                                                "fullName",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`w-full border rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                            errors.fullName
                                                                ? "bg-red-500/10 border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                                                                : "bg-gray-800/30 border-gray-700/30 focus:ring-amber-500/50 focus:border-amber-500/30"
                                                        }`}
                                                        placeholder="John Smith"
                                                        required
                                                    />
                                                    {errors.fullName ? (
                                                        <p className="text-sm text-red-400 mt-1">
                                                            {errors.fullName}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-white/40 mt-2">
                                                            Name that will
                                                            appear on your
                                                            tickets
                                                        </p>
                                                    )}
                                                </div>
                                                {/* Date of Birth Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-white/60 mb-2">
                                                        Date of Birth *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={
                                                            holder.dateOfBirth
                                                        }
                                                        onChange={(e) =>
                                                            handleTicketHolderChange(
                                                                idx,
                                                                "dateOfBirth",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`w-full border rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                            errors.dateOfBirth
                                                                ? "bg-red-500/10 border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                                                                : "bg-gray-800/30 border-gray-700/30 focus:ring-amber-500/50 focus:border-amber-500/30"
                                                        }`}
                                                        required
                                                    />
                                                    {errors.dateOfBirth ? (
                                                        <p className="text-sm text-red-400 mt-1">
                                                            {errors.dateOfBirth}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-white/40 mt-2">
                                                            Required for ticket
                                                            validation
                                                        </p>
                                                    )}
                                                </div>
                                                {/* Nationality Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-white/60 mb-2">
                                                        Nationality *
                                                    </label>
                                                    <select
                                                        value={
                                                            holder.nationality
                                                        }
                                                        onChange={(e) =>
                                                            handleTicketHolderChange(
                                                                idx,
                                                                "nationality",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`w-full border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                            errors.nationality
                                                                ? "bg-red-500/10 border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                                                                : "bg-gray-800/30 border-gray-700/30 focus:ring-amber-500/50 focus:border-amber-500/30"
                                                        }`}
                                                        required
                                                        disabled={!tourist}
                                                    >
                                                        <option
                                                            value=""
                                                            className="bg-gray-800"
                                                        >
                                                            {tourist
                                                                ? "Select your nationality"
                                                                : "Egyptian"}
                                                        </option>
                                                        {nationalityOptions.map(
                                                            (nat) => (
                                                                <option
                                                                    key={nat}
                                                                    value={nat}
                                                                    className="bg-gray-800"
                                                                >
                                                                    {nat}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    {errors.nationality ? (
                                                        <p className="text-sm text-red-400 mt-1">
                                                            {errors.nationality}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-white/40 mt-2">
                                                            Required for entry
                                                            documentation
                                                        </p>
                                                    )}
                                                </div>
                                                {/* Email Input - Only show for first ticket holder */}
                                                {idx === 0 && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-white/60 mb-2">
                                                            Email Address *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={holder.email}
                                                            onChange={(e) =>
                                                                handleTicketHolderChange(
                                                                    idx,
                                                                    "email",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className={`w-full border rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                                errors.email
                                                                    ? "bg-red-500/10 border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                                                                    : "bg-gray-800/30 border-gray-700/30 focus:ring-amber-500/50 focus:border-amber-500/30"
                                                            }`}
                                                            placeholder="your@email.com"
                                                            required
                                                        />
                                                        {errors.email ? (
                                                            <p className="text-sm text-red-400 mt-1">
                                                                {errors.email}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-white/40 mt-2">
                                                                Your tickets
                                                                will be sent to
                                                                this email
                                                                address
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
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
                            {/* Use seat selections for accurate ticket information */}
                            {seatSelections.length > 0 && quote ? (
                                <>
                                    {seatSelections.map((selection, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between text-sm"
                                        >
                                            <span className="text-white/80">
                                                {selection.seat.zone === "vip"
                                                    ? "VIP"
                                                    : "Regular"}{" "}
                                                • Row {selection.seat.row}, Seat{" "}
                                                {selection.seat.number}
                                                <br />
                                                <span className="text-white/60 capitalize">
                                                    {selection.ticketType}
                                                </span>
                                            </span>
                                            <span className="text-white">
                                                {getCurrencySymbol()}{" "}
                                                {selection.price}
                                            </span>
                                        </div>
                                    ))}
                                    {/* promo line if exists */}
                                    {quote.lines
                                        .filter((l) =>
                                            l.label.startsWith("Promo")
                                        )
                                        .map((line, idx) => (
                                            <div
                                                key={`promo-${idx}`}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-red-400">
                                                    {line.label}
                                                </span>
                                                <span className="text-red-400">
                                                    {getCurrencySymbol()}{" "}
                                                    {line.amount}
                                                </span>
                                            </div>
                                        ))}
                                </>
                            ) : (
                                quote?.lines.map((line, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-white/80">
                                            {line.label}
                                        </span>
                                        <span className="text-white">
                                            {getCurrencySymbol()} {line.amount}
                                        </span>
                                    </div>
                                ))
                            )}

                            {/* Add-ons */}
                            {addons.length > 0 && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/80 font-medium">
                                            Add-ons
                                        </span>
                                    </div>
                                    {addons.map((addon, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between text-sm pl-2"
                                        >
                                            <span className="text-white/80">
                                                {addon.addonName ||
                                                    "Translation Headphone"}{" "}
                                                -{" "}
                                                {addon.optionLabel ||
                                                    "Selected Language"}
                                            </span>
                                            <span className="text-white">
                                                {getCurrencySymbol()}{" "}
                                                {isTouristPricing()
                                                    ? addon.price?.USD || 3
                                                    : addon.price?.EGP || 50}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}

                            <div className="border-t border-gray-700/30 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-lg font-medium text-white">
                                        Total
                                    </span>
                                    <span className="text-lg font-medium text-amber-400">
                                        {getCurrencySymbol()} {calculateTotal()}
                                    </span>
                                </div>
                            </div>

                            {/* Promo code input */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-2">
                                    Promo Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCodeInput}
                                        onChange={(e) =>
                                            setPromoCodeInput(e.target.value)
                                        }
                                        placeholder="Enter code"
                                        className="flex-grow bg-gray-800/40 border border-gray-700/30 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyPromoCode}
                                        disabled={
                                            promoCodeInput.trim() ===
                                            (appliedPromoLine
                                                ? appliedPromoLine.label
                                                      .split("–")[1]
                                                      ?.split("(")[0]
                                                      ?.trim()
                                                : "")
                                        }
                                        className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold text-sm hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                    >
                                        Apply
                                    </button>
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
