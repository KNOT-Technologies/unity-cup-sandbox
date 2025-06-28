import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Portal from "../common/Portal";

interface SeatSelectionWarningModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    seatCount: number;
    timeRemaining: number;
}

const SeatSelectionWarningModal = ({
    isOpen,
    onConfirm,
    onCancel,
    seatCount,
    timeRemaining,
}: SeatSelectionWarningModalProps) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 w-full max-w-md mx-4 relative"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-red-500/30 rounded-full blur-xl opacity-50"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-lg p-2 relative backdrop-blur-xl border border-amber-500/20">
                                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Warning: Active Seat Hold
                            </h3>

                            <div className="space-y-3 text-sm text-white/80">
                                <p>
                                    You currently have{" "}
                                    <span className="text-amber-400 font-medium">
                                        {seatCount} seat
                                        {seatCount > 1 ? "s" : ""}
                                    </span>{" "}
                                    on hold with{" "}
                                    <span className="text-amber-400 font-medium font-mono">
                                        {formatTime(timeRemaining)}
                                    </span>{" "}
                                    remaining.
                                </p>

                                <p>
                                    If you continue to seat selection, your
                                    current hold will be
                                    <span className="text-red-400 font-medium">
                                        {" "}
                                        cancelled
                                    </span>{" "}
                                    and you'll need to select seats from the
                                    beginning.
                                </p>

                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-4">
                                    <p className="text-amber-400 text-xs">
                                        💡 <strong>Tip:</strong> Consider
                                        completing your current purchase instead
                                        of starting over.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 border border-gray-600/50 hover:border-gray-500 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Go Back
                                </button>

                                <button
                                    onClick={onConfirm}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Start Over
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Portal>
    );
};

export default SeatSelectionWarningModal;
