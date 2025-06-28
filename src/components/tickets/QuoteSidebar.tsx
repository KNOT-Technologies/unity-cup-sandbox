import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, AlertCircle, Ticket } from "lucide-react";
import type { QuoteState, SeatSelection } from "../../types/tickets";

interface QuoteSidebarProps {
    quoteState: QuoteState;
    selections: SeatSelection[];
    onCancel: () => void;
    onRemoveSeat: (seatId: string) => void;
    onProceedToCheckout?: () => void;
}

const QuoteSidebar = ({
    quoteState,
    selections,
    onCancel,
    onRemoveSeat,
    onProceedToCheckout,
}: QuoteSidebarProps) => {
    const { quote, timeRemaining, isLoading, error } = quoteState;

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

    const currency = quote?.total.currency === "USD" ? "$" : "EGP";

    if (!quote && selections.length === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                className="fixed right-0 top-24 bottom-0 w-80 sm:w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 z-40 lg:relative lg:top-0 lg:w-full lg:bg-gray-800/20 lg:border lg:border-gray-700/20 lg:rounded-xl"
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative backdrop-blur-xl border border-amber-500/20">
                                    <Ticket className="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-white">
                                    Seat Hold
                                </h3>
                                {quote && (
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
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
                            aria-label="Cancel seat hold"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-white/60">
                                    Creating seat hold...
                                </div>
                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
                            >
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-red-400 font-medium">
                                        Hold Failed
                                    </p>
                                    <p className="text-xs text-red-400/80 mt-1">
                                        {error}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {selections.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-white/90">
                                    Selected Seats ({selections.length}/6)
                                </h4>

                                <AnimatePresence>
                                    {selections.map((selection) => (
                                        <motion.div
                                            key={selection.seat.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                y: -10,
                                                scale: 0.9,
                                            }}
                                            className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30 hover:border-amber-500/30 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">
                                                            {selection.seat
                                                                .zone === "vip"
                                                                ? "VIP"
                                                                : "Regular"}{" "}
                                                            • Row{" "}
                                                            {selection.seat.row}
                                                            , Seat{" "}
                                                            {
                                                                selection.seat
                                                                    .number
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-white/60 capitalize">
                                                            {
                                                                selection.ticketType
                                                            }
                                                        </span>
                                                        <span className="text-xs text-amber-400 font-medium">
                                                            {currency}{" "}
                                                            {selection.price}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        onRemoveSeat(
                                                            selection.seat.id
                                                        )
                                                    }
                                                    className="p-1 rounded hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                                                    aria-label={`Remove seat ${selection.seat.row}-${selection.seat.number}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {selections.length === 6 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center"
                                    >
                                        <p className="text-xs text-amber-400">
                                            Maximum 6 seats per order
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Quote Details */}
                        {quote && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg border border-amber-500/20"
                            >
                                <h4 className="text-sm font-medium text-white/90 mb-3">
                                    Price Breakdown
                                </h4>

                                <div className="space-y-2">
                                    {quote.lines.map((line, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between text-sm"
                                        >
                                            <span className="text-white/70">
                                                {line.label}
                                            </span>
                                            <span className="text-amber-400 font-medium">
                                                {line.currency === "USD"
                                                    ? "$"
                                                    : "EGP"}{" "}
                                                {line.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-px bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-amber-500/20 my-3"></div>

                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">
                                        Total
                                    </span>
                                    <span className="text-amber-400 font-bold text-lg">
                                        {quote.total.currency === "USD"
                                            ? "$"
                                            : "EGP"}{" "}
                                        {quote.total.amount}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer with countdown progress and checkout button */}
                    {quote && timeRemaining > 0 && (
                        <div className="p-4 border-t border-gray-700/50 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/60">
                                    Hold expires in
                                </span>
                                <span
                                    className={`font-mono ${getTimeColor(
                                        timeRemaining
                                    )}`}
                                >
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-700/30 rounded-full h-1">
                                <motion.div
                                    className={`h-1 rounded-full transition-colors duration-300 ${
                                        timeRemaining > 60
                                            ? "bg-green-400"
                                            : timeRemaining > 30
                                            ? "bg-yellow-400"
                                            : "bg-red-400"
                                    }`}
                                    initial={{ width: "100%" }}
                                    animate={{
                                        width: `${Math.max(
                                            0,
                                            (timeRemaining / 90) * 100
                                        )}%`,
                                    }}
                                    transition={{ duration: 1, ease: "linear" }}
                                />
                            </div>

                            {/* Proceed to Checkout Button */}
                            {onProceedToCheckout && selections.length > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={onProceedToCheckout}
                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 
                                        text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 
                                        hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed
                                        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                                >
                                    Proceed to Checkout • {currency}{" "}
                                    {quote.total.amount}
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuoteSidebar;
