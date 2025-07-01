import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Plus, Loader2 } from "lucide-react";
import type { SelectedSeat } from "../../types/tickets";

interface TicketSummaryProps {
    selectedSeats: SelectedSeat[];
    onRemoveSeat: (seatId: string) => void;
    className?: string;
    onProceedToCheckout: () => void;
    translationPreference?: {
        needed: boolean;
        language?: string;
        prices?: {
            EGP: number;
            USD: number;
        };
    };
    useCredits?: boolean;
    isTouristPricing?: boolean;
    /** Shows loading state on checkout button */
    isProcessing?: boolean;
}

const TicketSummary: React.FC<TicketSummaryProps> = ({
    selectedSeats,
    onRemoveSeat,
    className,
    onProceedToCheckout,
    translationPreference,
    useCredits = false,
    isTouristPricing = false,
    isProcessing = false,
}) => {
    const total = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

    // Get translation fee based on pricing type
    const getTranslationFee = () => {
        if (useCredits) return 1; // 1 credit per person

        if (translationPreference?.prices) {
            return isTouristPricing
                ? translationPreference.prices.USD
                : translationPreference.prices.EGP;
        }

        // Default fallback values
        return isTouristPricing ? 3 : 50;
    };

    const translationFee = getTranslationFee();
    const totalWithAddons = translationPreference?.needed
        ? total + translationFee * selectedSeats.length
        : total;

    // Get appropriate currency symbol
    const getCurrencySymbol = () => {
        if (useCredits) return "";
        return isTouristPricing ? "$" : "EGP";
    };

    return (
        <div
            className={`bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5 ${className}`}
        >
            <div className="p-5 flex flex-col h-full relative z-10">
                <div className="flex-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50 pointer-events-none"></div>
                            <div
                                className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300"
                            >
                                <Ticket className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                                Selected Tickets
                            </h3>
                            <p className="text-sm font-medium text-white/60">
                                {selectedSeats.length}{" "}
                                {selectedSeats.length === 1
                                    ? "ticket"
                                    : "tickets"}{" "}
                                selected
                            </p>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>
                </div>

                {selectedSeats.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 
              backdrop-blur-xl border border-amber-500/20 flex items-center justify-center mb-4"
                        >
                            <Ticket className="w-6 h-6 text-amber-400/50" />
                        </div>
                        <p className="text-white/60">No tickets selected</p>
                        <p className="text-sm text-white/40 mt-1">
                            Click on available seats to add tickets
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        <AnimatePresence initial={false}>
                            {selectedSeats.map((seat) => (
                                <motion.div
                                    key={seat.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3
                    hover:border-amber-500/20 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${
                              seat.zone === "vip"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-blue-400/20 text-blue-400"
                          }`}
                                                >
                                                    {seat.zone.toUpperCase()}
                                                </span>
                                                <span className="text-white/90">
                                                    Row {seat.row}, Seat{" "}
                                                    {seat.number}
                                                </span>
                                            </div>
                                            <div className="text-sm text-white/60 mb-1">
                                                {seat.ticketType === "senior"
                                                    ? "Senior"
                                                    : seat.ticketType ===
                                                      "student"
                                                    ? "Student"
                                                    : seat.ticketType ===
                                                      "child"
                                                    ? "Child"
                                                    : "Adult"}{" "}
                                                Ticket
                                            </div>

                                            {/* Guest Information */}
                                            {seat.guestInfo && (
                                                <div className="mt-3 p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-white/40">
                                                                Name:
                                                            </span>
                                                            <span className="text-white/90 ml-1 font-medium break-words">
                                                                {
                                                                    seat
                                                                        .guestInfo
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="sm:col-span-1 col-span-1">
                                                            <span className="text-white/40">
                                                                Email:
                                                            </span>
                                                            <span className="text-white/90 ml-1 font-medium break-all text-xs">
                                                                {
                                                                    seat
                                                                        .guestInfo
                                                                        .email
                                                                }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-white/40">
                                                                Age:
                                                            </span>
                                                            <span className="text-white/90 ml-1 font-medium">
                                                                {
                                                                    seat
                                                                        .guestInfo
                                                                        .age
                                                                }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-white/40">
                                                                Type:
                                                            </span>
                                                            <span
                                                                className={`ml-1 font-medium px-1.5 py-0.5 rounded text-xs ${
                                                                    seat
                                                                        .guestInfo
                                                                        .visitorType ===
                                                                    "local"
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : "bg-blue-500/20 text-blue-400"
                                                                }`}
                                                            >
                                                                {seat.guestInfo
                                                                    .visitorType ===
                                                                "local"
                                                                    ? "Local"
                                                                    : "Foreign"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Translation Information */}
                                                    <div className="mt-2 pt-2 border-t border-gray-600/20">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white/40 text-xs">
                                                                Translation:
                                                            </span>
                                                            {seat.guestInfo
                                                                .translationNeeded ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-green-400 text-xs font-medium">
                                                                        Yes
                                                                    </span>
                                                                    <span className="text-white/60 text-xs">
                                                                        (
                                                                        {
                                                                            seat
                                                                                .guestInfo
                                                                                .translationLanguage
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-red-400 text-xs font-medium">
                                                                    No
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 ml-4">
                                            {!useCredits && (
                                                <span className="text-amber-400 font-medium">
                                                    {`${getCurrencySymbol()}${Number(
                                                        seat.price
                                                    ).toLocaleString()}`}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onRemoveSeat(seat.id);
                                                }}
                                                className="text-white/40 hover:text-red-400 transition-colors duration-300 relative z-20"
                                                aria-label={`Remove ticket for Row ${seat.row}, Seat ${seat.number}`}
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {translationPreference?.needed &&
                            selectedSeats.length > 0 && (
                                <>
                                    <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent my-4"></div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50 pointer-events-none"></div>
                                                <div
                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                        backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300"
                                                >
                                                    <Plus className="w-5 h-5 text-amber-400" />
                                                </div>
                                            </div>
                                            <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                                                Add-ons
                                            </h3>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3
                      hover:border-amber-500/20 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-white/90">
                                                        Translation Headphones
                                                    </div>
                                                    <div className="text-sm text-white/60 mt-0.5">
                                                        {
                                                            translationPreference.language
                                                        }{" "}
                                                        (x{selectedSeats.length}
                                                        )
                                                    </div>
                                                    {!useCredits &&
                                                        translationPreference.prices && (
                                                            <div className="text-xs text-white/40 mt-0.5">
                                                                $
                                                                {
                                                                    translationPreference
                                                                        .prices
                                                                        .USD
                                                                }{" "}
                                                                for tourists
                                                            </div>
                                                        )}
                                                </div>
                                                <span className="text-amber-400 font-medium">
                                                    {useCredits
                                                        ? `${selectedSeats.length} credits`
                                                        : `${getCurrencySymbol()}${Number(
                                                              translationFee *
                                                                  selectedSeats.length
                                                          ).toLocaleString()}`}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </>
                            )}
                    </div>
                )}

                <div className="flex-none">
                    {selectedSeats.length > 0 && !useCredits && (
                        <>
                            <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-white/60">
                                    <span>Tickets Subtotal</span>
                                    <span>
                                        {`${getCurrencySymbol()}${Number(
                                            total
                                        ).toLocaleString()}`}
                                    </span>
                                </div>
                                {translationPreference?.needed && (
                                    <div className="flex justify-between text-white/60">
                                        <span>Translation Service</span>
                                        <span>
                                            {`${getCurrencySymbol()}${Number(
                                                translationFee *
                                                    selectedSeats.length
                                            ).toLocaleString()}`}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-medium pt-2">
                                    <span className="text-white">Total</span>
                                    <span className="text-amber-400">
                                        {`${getCurrencySymbol()}${Number(
                                            totalWithAddons
                                        ).toLocaleString()}`}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        onClick={onProceedToCheckout}
                        disabled={selectedSeats.length === 0 || isProcessing}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
              ${
                  selectedSeats.length > 0 && !isProcessing
                      ? "bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 hover:shadow-lg hover:shadow-amber-500/20"
                      : "bg-gray-800/50 text-white/30 cursor-not-allowed"
              }
            `}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="ml-1">
                                    {useCredits
                                        ? "Booking..."
                                        : "Processing..."}
                                </span>
                            </>
                        ) : (
                            <>
                                {useCredits
                                    ? "Book with Credits"
                                    : "Proceed to Checkout"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketSummary;
