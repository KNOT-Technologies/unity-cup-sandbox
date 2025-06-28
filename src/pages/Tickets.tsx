import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DatePicker from "../components/tickets/DatePicker";
import ShowTimeSelector from "../components/tickets/ShowTimeSelector";
import SeatMap from "../components/tickets/SeatMap";
import TicketSummary from "../components/tickets/TicketSummary";
import TranslationSelector from "../components/tickets/TranslationSelector";
import QuoteSidebar from "../components/tickets/QuoteSidebar";
import SeatSelectionWarningModal from "../components/tickets/SeatSelectionWarningModal";
import type {
    UserType,
    Seat,
    TicketType,
    ShowTime,
    Occurrence,
    SeatSelection,
} from "../types/tickets";
import { useSchedule, usePrices, useQuote } from "../hooks/useApi";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";

interface TranslationPreference {
    needed: boolean;
    language?: string;
}

const Tickets = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState<UserType>("tourist");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>();
    const [seatSelections, setSeatSelections] = useState<SeatSelection[]>([]);
    const [translationPreference, setTranslationPreference] =
        useState<TranslationPreference>({
            needed: false,
        });

    // Use a fixed eventId for the Sound & Light show
    const eventId = "685d771de88d1161a488bf0f";
    const {
        occurrences,
        isLoading: isLoadingSchedule,
        error: scheduleError,
    } = useSchedule(eventId);

    // Fetch prices for the selected occurrence
    const { pricingData } = usePrices(selectedOccurrenceId || null);

    // Quote management
    const quoteState = useQuote(selectedOccurrenceId || null);

    // Toast notifications
    const { toasts, removeToast, showWarning } = useToast();

    // Warning modal state
    const [showWarningModal, setShowWarningModal] = useState(false);

    // Extract available dates from occurrences for the DatePicker
    const availableDates: Date[] = useMemo(() => {
        if (!Array.isArray(occurrences)) return [];

        const uniqueDates = new Set<string>();
        const dates: Date[] = [];

        occurrences.forEach((occurrence: Occurrence) => {
            const occurrenceDate = new Date(occurrence.startAt);
            const dateString = occurrenceDate.toDateString();

            if (!uniqueDates.has(dateString)) {
                uniqueDates.add(dateString);
                dates.push(
                    new Date(
                        occurrenceDate.getFullYear(),
                        occurrenceDate.getMonth(),
                        occurrenceDate.getDate()
                    )
                );
            }
        });

        return dates.sort((a, b) => a.getTime() - b.getTime());
    }, [occurrences]);

    // Transform API occurrences to ShowTime format and filter by selected date
    const showTimes: ShowTime[] = useMemo(() => {
        if (!Array.isArray(occurrences)) return [];

        // Filter occurrences for the selected date
        const filteredOccurrences = occurrences.filter(
            (occurrence: Occurrence) => {
                const occurrenceDate = new Date(occurrence.startAt);
                const selectedDateString = selectedDate.toDateString();
                const occurrenceDateString = occurrenceDate.toDateString();
                return selectedDateString === occurrenceDateString;
            }
        );

        return filteredOccurrences.map((occurrence: Occurrence) => ({
            id: occurrence.id,
            time: new Date(occurrence.startAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            language: occurrence.language,
        }));
    }, [occurrences, selectedDate]);

    // Reset selected occurrence when date changes
    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedOccurrenceId(undefined);
        setSeatSelections([]); // Also clear selected seats when date changes
        quoteState.cancelQuote(); // Cancel any existing quote
    };

    // Auto-select first available date when occurrences load
    useEffect(() => {
        if (availableDates.length > 0 && !isLoadingSchedule) {
            const currentSelectedHasShows = availableDates.some(
                (date) => date.toDateString() === selectedDate.toDateString()
            );

            // If current selected date has no shows, switch to first available date
            if (!currentSelectedHasShows) {
                setSelectedDate(availableDates[0]);
                setSelectedOccurrenceId(undefined);
                setSeatSelections([]);
                quoteState.cancelQuote();
            }
        }
    }, [availableDates, isLoadingSchedule, quoteState]);

    // Check if user is returning from checkout with an active quote
    useEffect(() => {
        const fromCheckout = sessionStorage.getItem("fromCheckout");
        const hasActiveQuote =
            quoteState.hasActiveQuote && quoteState.timeRemaining > 0;

        if (fromCheckout === "true" && hasActiveQuote) {
            setShowWarningModal(true);
            sessionStorage.removeItem("fromCheckout");
        }
    }, [quoteState.hasActiveQuote, quoteState.timeRemaining]);

    const handleWarningConfirm = () => {
        setShowWarningModal(false);
        quoteState.cancelQuote();
        setSeatSelections([]);
    };

    const handleWarningCancel = () => {
        setShowWarningModal(false);
        // Mark that they're going back to checkout
        sessionStorage.setItem("fromCheckout", "true");
        navigate("/checkout");
    };

    // Helper function to find price from API data
    const findPrice = (
        userType: UserType,
        seatClass: "vip" | "regular",
        category: TicketType
    ): number => {
        // Use the appropriate price matrix based on user type
        const relevantPrices =
            userType === "tourist"
                ? pricingData.foreignPrices
                : pricingData.localPrices;

        if (!relevantPrices.length) {
            // Fallback prices if API is not available
            const fallbackPricing = {
                tourist: {
                    regular: { senior: 50, adult: 45, student: 40, child: 30 },
                    vip: { senior: 80, adult: 75, student: 70, child: 60 },
                },
                local: {
                    regular: {
                        senior: 400,
                        adult: 350,
                        student: 300,
                        child: 200,
                    },
                    vip: { senior: 700, adult: 650, student: 600, child: 500 },
                },
            };
            return fallbackPricing[userType][seatClass][category];
        }

        // Map UI values to API values
        const apiVisitor = userType === "tourist" ? "foreign" : "local";
        const apiCategory = category;

        const priceItem = relevantPrices.find(
            (p) =>
                p.visitor === apiVisitor &&
                p.seatClass === seatClass &&
                p.category === apiCategory
        );

        return priceItem?.amount || 0;
    };

    const handleSeatSelect = (seat: Seat, ticketType: TicketType) => {
        // Enforce 6 seat limit
        if (seatSelections.length >= 6) {
            showWarning("Maximum 6 seats per order");
            return;
        }

        const price = findPrice(userType, seat.zone, ticketType);
        const newSelection: SeatSelection = {
            seat,
            ticketType,
            price,
        };

        const newSelections = [...seatSelections, newSelection];
        setSeatSelections(newSelections);

        // Create/update quote with debouncing
        quoteState.createQuote(newSelections, userType);
    };

    const handleSeatRemove = (seatId: string) => {
        const newSelections = seatSelections.filter(
            (selection) => selection.seat.id !== seatId
        );
        setSeatSelections(newSelections);

        if (newSelections.length === 0) {
            // Cancel quote if no seats selected
            quoteState.cancelQuote();
        } else {
            // Update quote with remaining seats
            quoteState.createQuote(newSelections, userType);
        }
    };

    const handleTranslationChange = (needed: boolean, language?: string) => {
        setTranslationPreference({ needed, language });
    };

    const handleProceedToCheckout = () => {
        if (!quoteState.quote) return;

        // Store quote data for Sprint 3 checkout
        sessionStorage.setItem(
            "currentQuote",
            JSON.stringify(quoteState.quote)
        );

        // Convert translation preferences to addon selections if needed
        if (translationPreference.needed && translationPreference.language) {
            const seatLabels = seatSelections.map(
                (selection) => `${selection.seat.row}-${selection.seat.number}`
            );
            // Create placeholder addon selections - real addon IDs would come from the API
            const addonSelections = seatLabels.map((seatLabel) => ({
                seat: seatLabel,
                addonId: "translation-headphone-addon-id", // This would be the real addon ID from the API
                optionCode:
                    translationPreference.language
                        ?.toLowerCase()
                        .substring(0, 2) || "en",
            }));
            sessionStorage.setItem(
                "selectedAddons",
                JSON.stringify(addonSelections)
            );
        }

        // Mark that user is going to checkout so we can detect return
        sessionStorage.setItem("fromCheckout", "false"); // They're going TO checkout
        navigate("/checkout");
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 sm:pt-32 pb-16">
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            {/* Warning Modal for returning from checkout */}
            <SeatSelectionWarningModal
                isOpen={showWarningModal}
                onConfirm={handleWarningConfirm}
                onCancel={handleWarningCancel}
                seatCount={seatSelections.length}
                timeRemaining={quoteState.timeRemaining}
            />

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 sm:gap-8">
                    <div className="space-y-4 sm:space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            <DatePicker
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                                availableDates={availableDates}
                            />
                            <div className="sm:block">
                                {isLoadingSchedule ? (
                                    <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl p-5 border border-gray-700/20 h-full flex items-center justify-center">
                                        <div className="text-white/60">
                                            Loading show times...
                                        </div>
                                    </div>
                                ) : scheduleError ? (
                                    <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl p-5 border border-red-500/20 h-full flex items-center justify-center">
                                        <div className="text-red-400">
                                            Failed to load show times
                                        </div>
                                    </div>
                                ) : showTimes.length === 0 ? (
                                    <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl p-5 border border-gray-700/20 h-full flex items-center justify-center">
                                        <div className="text-white/60">
                                            {Array.isArray(occurrences) &&
                                            occurrences.length > 0
                                                ? "No shows available on selected date"
                                                : "No shows available"}
                                        </div>
                                    </div>
                                ) : (
                                    <ShowTimeSelector
                                        selectedOccurrenceId={
                                            selectedOccurrenceId
                                        }
                                        onOccurrenceSelect={
                                            setSelectedOccurrenceId
                                        }
                                        showTimes={showTimes}
                                        className="h-full"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="sm:block">
                            <TranslationSelector
                                onTranslationChange={handleTranslationChange}
                                occurrenceId={selectedOccurrenceId}
                                className="h-full"
                            />
                        </div>

                        {selectedOccurrenceId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SeatMap
                                    userType={userType}
                                    onUserTypeChange={setUserType}
                                    onSeatSelect={handleSeatSelect}
                                    onSeatDeselect={handleSeatRemove}
                                    selectedSeatIds={seatSelections.map(
                                        (selection) => selection.seat.id
                                    )}
                                    occurrenceId={selectedOccurrenceId}
                                    findPrice={findPrice}
                                />
                            </motion.div>
                        )}
                    </div>

                    <div className="relative lg:h-[calc(100vh-8rem)]">
                        <div className="lg:sticky lg:top-32">
                            {/* Show QuoteSidebar when seats are selected or quote is active */}
                            {(seatSelections.length > 0 ||
                                quoteState.hasActiveQuote) && (
                                <QuoteSidebar
                                    quoteState={quoteState}
                                    selections={seatSelections}
                                    onCancel={quoteState.cancelQuote}
                                    onRemoveSeat={handleSeatRemove}
                                    onProceedToCheckout={
                                        handleProceedToCheckout
                                    }
                                />
                            )}

                            {/* Fallback to TicketSummary for backward compatibility when no quote is active */}
                            {seatSelections.length === 0 &&
                                !quoteState.hasActiveQuote && (
                                    <TicketSummary
                                        selectedSeats={[]} // Empty array since we're using seatSelections now
                                        userType={userType}
                                        onRemoveSeat={handleSeatRemove}
                                        className="max-h-[calc(100vh-10rem)] overflow-y-auto"
                                        onProceedToCheckout={
                                            handleProceedToCheckout
                                        }
                                        translationPreference={
                                            translationPreference
                                        }
                                    />
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tickets;
