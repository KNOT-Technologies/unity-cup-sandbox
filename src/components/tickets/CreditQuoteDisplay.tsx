import { motion } from "framer-motion";
import { Clock, Coins, AlertTriangle } from "lucide-react";
import type { CreditQuoteData } from "../../types/tickets";

interface CreditQuoteDisplayProps {
    quote: CreditQuoteData | null;
    timeRemaining: number;
    isLoading: boolean;
    error: string | null;
}

const CreditQuoteDisplay = ({
    quote,
    timeRemaining,
    isLoading,
    error,
}: CreditQuoteDisplayProps) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/20 backdrop-blur-xl rounded-xl p-4 border border-gray-700/20"
            >
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-400"></div>
                    <span className="text-white/80">
                        Calculating credit cost...
                    </span>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 backdrop-blur-xl rounded-xl p-4 border border-red-500/20"
            >
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{error}</span>
                </div>
            </motion.div>
        );
    }

    if (!quote) {
        return null;
    }

    const isExpiringSoon = timeRemaining <= 60; // Warning when less than 1 minute left
    const isExpired = timeRemaining <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-xl rounded-xl p-4 border transition-all duration-300 ${
                isExpired
                    ? "bg-red-500/10 border-red-500/20"
                    : isExpiringSoon
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-emerald-500/10 border-emerald-500/20"
            }`}
        >
            <div className="space-y-3">
                {/* Header with countdown */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-lg blur-lg opacity-50"></div>
                            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg p-1.5 relative backdrop-blur-xl border border-emerald-500/20">
                                <Coins className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>
                        <span className="text-emerald-400 font-semibold">
                            Credit Quote
                        </span>
                    </div>

                    {!isExpired && (
                        <div className="flex items-center gap-2">
                            <Clock
                                className={`w-4 h-4 ${
                                    isExpiringSoon
                                        ? "text-amber-400"
                                        : "text-white/60"
                                }`}
                            />
                            <span
                                className={`font-mono ${
                                    isExpiringSoon
                                        ? "text-amber-400"
                                        : "text-white/80"
                                }`}
                            >
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Quote breakdown */}
                <div className="space-y-2">
                    {quote.lines.map((line, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center"
                        >
                            <span className="text-white/80 text-sm">
                                {line.label}
                            </span>
                            <span className="text-white font-medium">
                                {line.credits} credits
                            </span>
                        </div>
                    ))}

                    {/* Total */}
                    <div className="h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-emerald-400 font-bold text-lg">
                            {quote.total.credits} credits
                        </span>
                    </div>
                </div>

                {/* Expired message */}
                {isExpired && (
                    <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-red-500/20">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm font-medium">
                            Quote expired. Please select seats again.
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CreditQuoteDisplay;
