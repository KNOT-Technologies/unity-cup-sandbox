import { useState, useMemo, useEffect, useRef } from "react";
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
    prices?: {
        EGP: number;
        USD: number;
    };
}

const Tickets = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState<UserType>("tourist");
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const storedDate = sessionStorage.getItem("selectedDate");
        return storedDate ? new Date(storedDate) : new Date();
    });
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

    // Display toast on quote error
    useEffect(() => {
        if (quoteState.error) {
            showWarning(quoteState.error);
        }
    }, [quoteState.error]);

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

    // Handle user type changes - only allow if no seats are selected
    const handleUserTypeChange = (newUserType: UserType) => {
        if (seatSelections.length > 0) {
            showWarning(
                `You can only select ${userType} tickets for this order`
            );
            return;
        }
        setUserType(newUserType);
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
            // Update quote with new selections
            quoteState.createQuote(newSelections, userType);
        }
    };

    const handleTranslationChange = (needed: boolean, language?: string) => {
        // Default prices if not provided from API
        const defaultPrices = {
            EGP: 50,
            USD: 3,
        };

        const preference = {
            needed,
            language,
            prices: defaultPrices, // In a real app, these would come from the API
        };

        // Update state
        setTranslationPreference(preference);

        // Store in sessionStorage for other components to access
        if (needed && language) {
            sessionStorage.setItem(
                "translationPreference",
                JSON.stringify(preference)
            );
        } else {
            // Clear if translation is not needed
            sessionStorage.removeItem("translationPreference");
        }
    };

    const handleProceedToCheckout = () => {
        if (!quoteState.quote) return;

        // Store quote data for Sprint 3 checkout
        sessionStorage.setItem(
            "currentQuote",
            JSON.stringify(quoteState.quote)
        );

        // Store seat selections for accurate price breakdown
        sessionStorage.setItem(
            "seatSelections",
            JSON.stringify(seatSelections)
        );

        // Clear any previous addon selections
        sessionStorage.removeItem("selectedAddons");

        // Convert translation preferences to addon selections if needed
        if (translationPreference.needed && translationPreference.language) {
            // Create one addon selection per seat
            const addonSelections = seatSelections.map((selection) => {
                const seatLabel = `${selection.seat.row}-${selection.seat.number}`;

                return {
                    seat: seatLabel,
                    addonId: "translation-headphone-addon-id", // This would be the real addon ID from the API
                    optionCode:
                        translationPreference.language
                            ?.toLowerCase()
                            .substring(0, 2) || "en",
                    addonName: "Translation Headphone",
                    optionLabel: translationPreference.language,
                    price: translationPreference.prices,
                };
            });

            if (addonSelections.length > 0) {
                sessionStorage.setItem(
                    "selectedAddons",
                    JSON.stringify(addonSelections)
                );
            }
        }

        // Mark that user is going to checkout so we can detect return
        sessionStorage.setItem("fromCheckout", "false"); // They're going TO checkout
        navigate("/checkout");
    };

    // Restore selections and occurrence when coming back from checkout
    useEffect(() => {
        const storedSelections = sessionStorage.getItem("seatSelections");
        const storedOccurrence = sessionStorage.getItem("selectedOccurrenceId");
        const storedDate = sessionStorage.getItem("selectedDate");
        if (storedSelections) {
            try {
                const parsed: SeatSelection[] = JSON.parse(storedSelections);
                if (parsed.length) {
                    setSeatSelections(parsed);
                }
            } catch {
                /* ignore */
            }
        }
        if (storedOccurrence) {
            setSelectedOccurrenceId(storedOccurrence);
        }
        if (storedDate) {
            const d = new Date(storedDate);
            if (!isNaN(d.getTime())) {
                setSelectedDate(d);
            }
        }
    }, []);

    // Persist selections and occurrence to sessionStorage whenever they change
    useEffect(() => {
        sessionStorage.setItem(
            "seatSelections",
            JSON.stringify(seatSelections)
        );
        if (selectedOccurrenceId) {
            sessionStorage.setItem(
                "selectedOccurrenceId",
                selectedOccurrenceId
            );
        }
        sessionStorage.setItem("selectedDate", selectedDate.toISOString());
    }, [seatSelections, selectedOccurrenceId, selectedDate]);

    // Clear selections when the user switches to a different occurrence (show time)
    const prevOccurrenceRef = useRef<string | undefined>();
    useEffect(() => {
        if (
            prevOccurrenceRef.current &&
            selectedOccurrenceId &&
            prevOccurrenceRef.current !== selectedOccurrenceId
        ) {
            setSeatSelections([]);
            quoteState.cancelQuote();
        }
        prevOccurrenceRef.current = selectedOccurrenceId;
    }, [selectedOccurrenceId]);

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
                                currency={
                                    userType === "tourist" ? "USD" : "EGP"
                                }
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
                                    onUserTypeChange={handleUserTypeChange}
                                    onSeatSelect={handleSeatSelect}
                                    onSeatDeselect={handleSeatRemove}
                                    selectedSeatIds={seatSelections.map(
                                        (selection) => selection.seat.id
                                    )}
                                    occurrenceId={selectedOccurrenceId}
                                    findPrice={findPrice}
                                    selectedDate={selectedDate}
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
                                        onRemoveSeat={handleSeatRemove}
                                        className="max-h-[calc(100vh-10rem)] overflow-y-auto"
                                        onProceedToCheckout={
                                            handleProceedToCheckout
                                        }
                                        translationPreference={
                                            translationPreference
                                        }
                                        isTouristPricing={
                                            userType === "tourist"
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
