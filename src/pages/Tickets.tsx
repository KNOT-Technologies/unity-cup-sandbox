import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
    addonId?: string;
    optionCode?: string;
    prices?: {
        EGP: number;
        USD: number;
    };
}

const Tickets = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState<UserType>("tourist");
    const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>();
    const [seatSelections, setSeatSelections] = useState<SeatSelection[]>([]);
    const [translationPreference, setTranslationPreference] =
        useState<TranslationPreference>({
            needed: false,
        });

    // Use a fixed eventId for the Unity Cup matches
    const eventId = "68739fa044dbbfd4cc3a025a";
    const { occurrences } = useSchedule(eventId);

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

            // If the quote has expired, clear all client-side state related to it
            if (quoteState.error.toLowerCase().includes("expired")) {
                setSeatSelections([]);

                // Remove any persisted data so that a fresh quote can be created
                sessionStorage.removeItem("seatSelections");
                sessionStorage.removeItem("translationPreference");
                sessionStorage.removeItem("selectedAddons");
                sessionStorage.removeItem("currentQuote");
            }
        }
    }, [quoteState.error]);

    // Warning modal state
    const [showWarningModal, setShowWarningModal] = useState(false);

    // Transform API occurrences to ShowTime format
    const showTimes: ShowTime[] = useMemo(() => {
        if (!Array.isArray(occurrences)) return [];

        return occurrences.map((occurrence: Occurrence) => ({
            id: occurrence.id,
            time: new Date(occurrence.startAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Africa/Cairo",
            }),
            language: occurrence.language,
        }));
    }, [occurrences]);

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

    // Clear quote state if user has completed payment (detected by cleared storage)
    useEffect(() => {
        // Only check if we have an active quote
        if (!quoteState.hasActiveQuote) return;

        const currentQuote = sessionStorage.getItem("currentQuote");
        const storedSelections = sessionStorage.getItem("seatSelections");
        const selectedAddons = sessionStorage.getItem("selectedAddons");

        // If all selection storage is cleared but we still have a quote state,
        // it means user completed payment and the quote is stale (backend deleted it)
        if (!currentQuote && !storedSelections && !selectedAddons) {
            console.log(
                "Detected stale quote after payment completion, clearing..."
            );
            quoteState.cancelQuote();
            setSeatSelections([]);
        }
    }, [quoteState.hasActiveQuote]);

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

    // NEW: Cancel seat hold entirely (quote + selections)
    const handleCancelSeatHold = () => {
        setSeatSelections([]); // Clear all selected seats
        quoteState.cancelQuote(); // Remove the quote from both client & server
        sessionStorage.removeItem("seatSelections"); // Ensure persistence layer is cleared
    };

    const handleTranslationChange = (
        needed: boolean,
        language?: string,
        addonId?: string,
        optionCode?: string
    ) => {
        // Default prices if not provided from API
        const defaultPrices = {
            EGP: 50,
            USD: 3,
        };

        const preference = {
            needed,
            language,
            addonId,
            optionCode,
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
        if (
            translationPreference.needed &&
            translationPreference.language &&
            translationPreference.addonId
        ) {
            // Create one addon selection per seat
            const addonSelections = seatSelections.map((selection) => {
                const seatLabel = `${selection.seat.row}-${selection.seat.number}`;

                return {
                    seat: seatLabel,
                    addonId: translationPreference.addonId,
                    optionCode:
                        translationPreference.optionCode ||
                        translationPreference.language
                            ?.toLowerCase()
                            .substring(0, 2) ||
                        "en",
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
    }, [seatSelections, selectedOccurrenceId]);

    // Clear selections when the user switches to a different occurrence (show time)
    const prevOccurrenceRef = useRef<string | undefined>(undefined);
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
        <div className="relative min-h-screen bg-black">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

            {/* Logo */}
            <div className="fixed top-8 left-8 z-50">
                <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    src="/UnityAfrexim.png.avif"
                    alt="Unity Afrexim Logo"
                    className="h-16 w-auto"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-[90%] mx-auto pt-32 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Seat Selection */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <ShowTimeSelector
                                    showTimes={showTimes}
                                    selectedOccurrenceId={selectedOccurrenceId}
                                    onOccurrenceSelect={setSelectedOccurrenceId}
                                />
                            </div>

                            {selectedOccurrenceId && (
                                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    <SeatMap
                                        occurrenceId={selectedOccurrenceId}
                                        selectedDate={new Date("2026-05-27")}
                                        userType={userType}
                                        onUserTypeChange={handleUserTypeChange}
                                        onSeatSelect={handleSeatSelect}
                                        onSeatDeselect={handleSeatRemove}
                                        selectedSeatIds={seatSelections.map(
                                            (selection) => selection.seat.id
                                        )}
                                        findPrice={findPrice}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Column - Summary and Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 sticky top-8">
                                <TicketSummary
                                    selectedSeats={seatSelections.map(
                                        (selection) => ({
                                            ...selection.seat,
                                            ticketType: selection.ticketType,
                                            price: selection.price,
                                        })
                                    )}
                                    onRemoveSeat={handleSeatRemove}
                                    onProceedToCheckout={
                                        handleProceedToCheckout
                                    }
                                    translationPreference={
                                        translationPreference
                                    }
                                    isTouristPricing={userType === "tourist"}
                                />

                                {seatSelections.length > 0 && (
                                    <div className="mt-6">
                                        <TranslationSelector
                                            onTranslationChange={
                                                handleTranslationChange
                                            }
                                            occurrenceId={selectedOccurrenceId}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Modals and Toasts */}
            <SeatSelectionWarningModal
                isOpen={showWarningModal}
                onConfirm={handleWarningConfirm}
                onCancel={handleWarningCancel}
                seatCount={seatSelections.length}
                timeRemaining={quoteState.timeRemaining}
            />
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            {quoteState.hasActiveQuote && (
                <QuoteSidebar
                    quoteState={quoteState}
                    selections={seatSelections}
                    onCancel={handleCancelSeatHold}
                    onRemoveSeat={handleSeatRemove}
                    onProceedToCheckout={handleProceedToCheckout}
                />
            )}
        </div>
    );
};

export default Tickets;
