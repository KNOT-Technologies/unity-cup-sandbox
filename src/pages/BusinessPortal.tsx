import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Receipt,
    Settings,
    LayoutDashboard,
    CreditCard,
    Clock,
    Plus,
    Percent,
    Coins,
    Download,
    CalendarDays,
    Ticket,
    Upload,
    AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import DatePicker from "../components/tickets/DatePicker";
import ShowTimeSelector from "../components/tickets/ShowTimeSelector";
import SeatMap from "../components/tickets/SeatMap";
import TicketSummary from "../components/tickets/TicketSummary";
import GuestUploadModal from "../components/common/GuestUploadModal";
import CreditQuoteDisplay from "../components/tickets/CreditQuoteDisplay";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DemographicCharts from "../components/dashboard/DemographicCharts";
import {
    useCreditBalance,
    useCreditBundles,
    useSchedule,
    useCreditPrices,
    useCreditQuote,
} from "../hooks/useApi";
import {
    purchaseCreditBundle,
    checkoutWithCredits,
    type CreditPriceMatrix,
} from "../api/knot";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/common/Toast";
import type {
    Seat,
    TicketType,
    SelectedSeat,
    ShowTime,
    Occurrence,
    UserType,
} from "../types/tickets";

// Helper function to find credit cost from API pricing data
const findCreditCost = (
    creditPrices: CreditPriceMatrix | null | undefined,
    seatClass: "vip" | "regular",
    category: TicketType
): number => {
    if (!creditPrices?.prices) {
        // Fallback to hardcoded values if API data not available
        const fallbackCosts = {
            regular: { senior: 2, adult: 2, student: 1, child: 1 },
            vip: { senior: 3, adult: 3, student: 2, child: 2 },
        };
        return fallbackCosts[seatClass][category];
    }

    const priceItem = creditPrices.prices.find(
        (item) =>
            item.visitor === "local" &&
            item.seatClass === seatClass &&
            item.category === category
    );
    return priceItem?.credits || 1;
};

// Mock invoice data - in a real app, this would come from your backend
const ticketOrders = [
    {
        id: "INV-2024-001",
        date: "2024-03-15",
        tickets: 45,
        credits: 135,
        amount: 2025,
        status: "Paid",
    },
    {
        id: "INV-2024-002",
        date: "2024-03-12",
        tickets: 60,
        credits: 180,
        amount: 2700,
        status: "Paid",
    },
    {
        id: "INV-2024-003",
        date: "2024-03-08",
        tickets: 80,
        credits: 240,
        amount: 3600,
        status: "Paid",
    },
    {
        id: "INV-2024-004",
        date: "2024-03-05",
        tickets: 35,
        credits: 105,
        amount: 1575,
        status: "Paid",
    },
    {
        id: "INV-2024-005",
        date: "2024-02-28",
        tickets: 50,
        credits: 150,
        amount: 2250,
        status: "Paid",
    },
    {
        id: "INV-2024-006",
        date: "2024-02-25",
        tickets: 65,
        credits: 195,
        amount: 2925,
        status: "Paid",
    },
    {
        id: "INV-2024-007",
        date: "2024-02-20",
        tickets: 75,
        credits: 225,
        amount: 3375,
        status: "Paid",
    },
    {
        id: "INV-2024-008",
        date: "2024-02-15",
        tickets: 40,
        credits: 120,
        amount: 1800,
        status: "Paid",
    },
];

// Mock credit purchase data
const creditPurchases = [
    {
        id: "CRD-2024-001",
        date: "2024-03-14",
        credits: 500,
        amount: 2250,
    },
    {
        id: "CRD-2024-002",
        date: "2024-03-01",
        credits: 1000,
        amount: 4500,
    },
    {
        id: "CRD-2024-003",
        date: "2024-02-15",
        credits: 200,
        amount: 900,
    },
    {
        id: "CRD-2024-004",
        date: "2024-02-01",
        credits: 750,
        amount: 3375,
    },
];

const BusinessPortal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError, toasts, removeToast } = useToast();

    // Use fixed eventId for Sound & Light show (same as user portal)
    const eventId = "685d771de88d1161a488bf0f";

    // UI state
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
        useState(false);

    // Booking state
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>();
    const [visitorType, setVisitorType] = useState<UserType>("tourist");

    // API hooks
    const { balance, refetch: refetchBalance } = useCreditBalance();
    const {
        bundles: creditPackages,
        isLoading: bundlesLoading,
        error: bundlesError,
    } = useCreditBundles();
    const {
        occurrences,
        isLoading: isLoadingSchedule,
        error: scheduleError,
    } = useSchedule(eventId);

    // Credit pricing and quote management
    const { creditPrices } = useCreditPrices(selectedOccurrenceId || null);
    const creditQuoteState = useCreditQuote(selectedOccurrenceId || null);
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Mock user data - in a real app, this would come from your auth context/state
    const user = {
        name: "John Smith",
        initials: "JS",
    };

    // Price finding function for SeatMap component
    const findPrice = (
        _userType: string,
        seatClass: "vip" | "regular",
        category: TicketType
    ): number => {
        // Ensure the parameter is considered used to satisfy TypeScript's unused parameter rule
        void _userType;
        // When using credits, return credit cost instead of money price
        return findCreditCost(creditPrices ?? null, seatClass, category);
    };

    // Build dynamic creditCosts mapping for SeatMap display
    type Category = "senior" | "adult" | "student" | "child";
    type CostMap = {
        senior: number;
        adult: number;
        student: number;
        child: number;
    };

    const buildCreditCosts = (): { regular: CostMap; vip: CostMap } => {
        const defaultCosts: { regular: CostMap; vip: CostMap } = {
            regular: { senior: 2, adult: 2, student: 1, child: 1 },
            vip: { senior: 3, adult: 3, student: 2, child: 2 },
        };

        if (!creditPrices?.prices) return defaultCosts;

        // Clone defaults so we keep all required keys
        const mapping: { regular: CostMap; vip: CostMap } = {
            regular: { ...defaultCosts.regular },
            vip: { ...defaultCosts.vip },
        };

        (["senior", "adult", "student", "child"] as Category[]).forEach(
            (cat) => {
                (["regular", "vip"] as const).forEach((cls) => {
                    const item = creditPrices.prices.find(
                        (p) =>
                            p.visitor === visitorType &&
                            p.category === cat &&
                            p.seatClass === cls
                    );
                    if (item) {
                        mapping[cls][cat] = item.credits;
                    }
                });
            }
        );

        return mapping;
    };

    const dynamicCreditCosts = buildCreditCosts();

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("businessLoggedIn");
        navigate("/business/login");
    };

    const handlePurchase = async (bundleId: string, credits: number) => {
        try {
            const response = await purchaseCreditBundle(bundleId);

            // Find the bundle to get its price and currency
            const bundle = creditPackages.find((pkg) => pkg.id === bundleId);
            if (!bundle) {
                showError("Credit bundle not found");
                return;
            }

            // Navigate to payment page with credit purchase data (same pattern as checkout)
            navigate("/payment", {
                state: {
                    paymentData: {
                        clientSecret: response.clientSecret,
                        publicKey: response.publicKey,
                        total: {
                            amount: bundle.price,
                            currency: bundle.currency,
                        },
                        email: "business@example.com", // This would come from user data
                        userName: user.name,
                        creditPurchase: true,
                        creditsAmount: credits,
                    },
                },
            });
        } catch (error: unknown) {
            console.error("Purchase failed:", error);
            const apiError = error as { status?: number; error?: string };
            if (apiError.status === 404) {
                showError("Credit bundle not found");
            } else {
                showError(apiError.error || "Failed to initiate purchase");
            }
        }
    };

    const handleSeatSelect = (seat: Seat, ticketType: TicketType) => {
        const creditCost = findCreditCost(creditPrices, seat.zone, ticketType);
        
        // Check if we have guest data available for this seat (only if no existing guest data)
        const guestIndex = selectedSeats.length % mockGuests.length;
        const guestInfo = mockGuests[guestIndex];
        
        const newSelectedSeats = [
            ...selectedSeats,
            {
                ...seat,
                ticketType,
                price: creditCost, // We use this field for credit cost instead of money
                guestInfo, // Add guest information for new seats
            },
        ];
        setSelectedSeats(newSelectedSeats);

        // Create/update credit quote when seats are selected
        const allSelections = newSelectedSeats.map((selectedSeat) => ({
            seat: selectedSeat,
            ticketType: selectedSeat.ticketType,
            price: selectedSeat.price,
        }));
        
        // Use the guest's visitor type if available, otherwise use the current visitorType state
        const quoteVisitorType = guestInfo?.visitorType === 'foreign' ? 'foreign' : 'local';
        
        creditQuoteState.createQuote(
            allSelections,
            quoteVisitorType
        );
    };

    const handleSeatRemove = (seatId: string) => {
        const newSelectedSeats = selectedSeats.filter(
            (seat) => seat.id !== seatId
        );
        setSelectedSeats(newSelectedSeats);

        // Update credit quote when seats are removed
        if (newSelectedSeats.length === 0) {
            creditQuoteState.cancelQuote();
        } else {
            const allSelections = newSelectedSeats.map((selectedSeat) => ({
                seat: selectedSeat,
                ticketType: selectedSeat.ticketType,
                price: selectedSeat.price,
            }));
            
            // Use the visitor type from the first remaining seat, or default to 'local'
            const primaryVisitorType = newSelectedSeats[0]?.guestInfo?.visitorType === 'foreign' ? 'foreign' : 'local';
            
            creditQuoteState.createQuote(
                allSelections,
                primaryVisitorType
            );
        }
    };

    const handleProceedToCheckout = async () => {
        if (!selectedOccurrenceId || selectedSeats.length === 0) {
            showError("Please select seats to proceed");
            return;
        }

        if (!creditQuoteState.quote) {
            showError("Please wait for pricing to load");
            return;
        }

        const totalCreditsFromQuote = creditQuoteState.quote.total.credits;
        const totalWithTranslation = totalCreditsFromQuote;

        if (balance < totalWithTranslation) {
            setShowInsufficientCreditsModal(true);
            return;
        }

        try {
            await checkoutWithCredits({
                quoteId: creditQuoteState.quote.quoteId,
                paymentMethod: "credits",
            });

            showSuccess("Booking successful! Your tickets have been reserved.");
            setSelectedSeats([]);
            setSelectedOccurrenceId(undefined);
            creditQuoteState.cancelQuote(); // Clear the quote
            await refetchBalance(); // Refresh balance to show deducted credits
        } catch (error: unknown) {
            console.error("Checkout failed:", error);
            const apiError = error as { status?: number; error?: string };
            if (
                apiError.status === 400 &&
                apiError.error === "INSUFFICIENT_CREDITS"
            ) {
                setShowInsufficientCreditsModal(true);
            } else if (
                apiError.status === 400 &&
                apiError.error === "QUOTE_EXPIRED"
            ) {
                showError(
                    "Your seat selection has expired. Please select seats again."
                );
                setSelectedSeats([]);
                creditQuoteState.cancelQuote();
            } else {
                showError(
                    apiError.error || "Booking failed. Please try again."
                );
            }
        }
    };

    // Transform occurrences to ShowTime format
    const getShowTimesForDate = (date: Date): ShowTime[] => {
        if (!occurrences) return [];

        const dateString = date.toISOString().split("T")[0];

        return occurrences
            .filter((occurrence: Occurrence) => {
                const occurrenceDate = new Date(occurrence.startAt)
                    .toISOString()
                    .split("T")[0];
                return occurrenceDate === dateString;
            })
            .map((occurrence: Occurrence) => ({
                id: occurrence.id,
                time: new Date(occurrence.startAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Africa/Cairo",
                }),
                language: occurrence.language,
            }));
    };

    // Get available dates from occurrences
    const getAvailableDates = (): Date[] => {
        if (!occurrences) return [];

        const dates = new Set<string>();
        occurrences.forEach((occurrence: Occurrence) => {
            const date = new Date(occurrence.startAt)
                .toISOString()
                .split("T")[0];
            dates.add(date);
        });

        return Array.from(dates)
            .map((dateString) => new Date(dateString))
            .sort((a, b) => a.getTime() - b.getTime());
    };

    const availableDates = getAvailableDates();
    const showTimesForSelectedDate = getShowTimesForDate(selectedDate);

    const handleDownloadInvoice = (invoiceId: string) => {
        // In a real app, this would trigger a PDF download
        console.log("Downloading invoice:", invoiceId);
    };

    const handleUploadGuestDetails = () => {
        setShowUploadModal(true);
    };

    // Mock guest data for demo purposes
    const mockGuests = [
        {
            name: "Adam Smith",
            email: "adam.smith@email.com",
            age: 45,
            visitorType: "foreign" as const,
            translationNeeded: false,
        },
        {
            name: "Sarah Johnson",
            email: "sarah.johnson@email.com",
            age: 28,
            visitorType: "foreign" as const,
            translationNeeded: true,
            translationLanguage: "English",
        },
        {
            name: "Fatima Al-Zahra",
            email: "fatima.alzahra@email.com",
            age: 52,
            visitorType: "foreign" as const,
            translationNeeded: false,
        },
        {
            name: "Michael Chen",
            email: "michael.chen@email.com",
            age: 31,
            visitorType: "foreign" as const,
            translationNeeded: true,
            translationLanguage: "English",
        },
        {
            name: "Aisha Mohammed",
            email: "aisha.mohammed@email.com",
            age: 22,
            visitorType: "foreign" as const,
            translationNeeded: false,
        },
        {
            name: "David Rodriguez",
            email: "david.rodriguez@email.com",
            age: 38,
            visitorType: "foreign" as const,
            translationNeeded: true,
            translationLanguage: "Spanish",
        },
        {
            name: "Jake Wilson",
            email: "jake.wilson@email.com",
            age: 19,
            visitorType: "foreign" as const,
            translationNeeded: false,
        },
        {
            name: "Emma Wilson",
            email: "emma.wilson@email.com",
            age: 26,
            visitorType: "foreign" as const,
            translationNeeded: true,
            translationLanguage: "English",
        },
    ];

    const handleGuestFileUpload = async (): Promise<number> => {
        // In a real app, this would be an API call to process the file
        // For now, we'll simulate processing with a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Auto-select seats based on uploaded guest data - use all 8 guests
        const numberOfGuests = mockGuests.length; // Always use all 8 guests
        const autoSelectedSeats: SelectedSeat[] = [];
        
        // Separate guests into VIP and regular based on realistic criteria
        const vipGuests = mockGuests.filter((guest, index) => 
            index < 2 || (guest.age >= 65) || (guest.translationNeeded && guest.age >= 30)
        );
        const regularGuests = mockGuests.filter((guest, index) => 
            !(index < 2 || (guest.age >= 65) || (guest.translationNeeded && guest.age >= 30))
        );
        
        // Assign VIP seats together in row A
        vipGuests.forEach((guest, index) => {
            const mockSeat: Seat = {
                id: `A-${index + 1}`, // A1, A2, A3, etc.
                row: 'A',
                number: index + 1,
                zone: 'vip',
                status: 'available'
            };
            
            // Determine ticket type based on age
            let ticketType: TicketType = 'adult';
            if (guest.age < 12) ticketType = 'child';
            else if (guest.age >= 65) ticketType = 'senior';
            else if (guest.age < 25) ticketType = 'student';
            
            const creditCost = findCreditCost(creditPrices, mockSeat.zone, ticketType);
            
            autoSelectedSeats.push({
                ...mockSeat,
                ticketType,
                price: creditCost,
                guestInfo: guest,
            });
        });
        
        // Assign regular seats together in rows F and G
        regularGuests.forEach((guest, index) => {
            const row = index < 4 ? 'F' : 'G'; // First 4 in row F, rest in row G
            const seatNumber = index < 4 ? index + 1 : index - 3; // F1-F4, then G1-G4
            
            const mockSeat: Seat = {
                id: `${row}-${seatNumber}`,
                row: row,
                number: seatNumber,
                zone: 'regular',
                status: 'available'
            };
            
            // Determine ticket type based on age
            let ticketType: TicketType = 'adult';
            if (guest.age < 12) ticketType = 'child';
            else if (guest.age >= 65) ticketType = 'senior';
            else if (guest.age < 25) ticketType = 'student';
            
            const creditCost = findCreditCost(creditPrices, mockSeat.zone, ticketType);
            
            autoSelectedSeats.push({
                ...mockSeat,
                ticketType,
                price: creditCost,
                guestInfo: guest,
            });
        });
        
        console.log('Auto-selecting seats:', autoSelectedSeats);
        setSelectedSeats(autoSelectedSeats);
        
        // Create credit quote for the auto-selected seats
        if (autoSelectedSeats.length > 0 && selectedOccurrenceId) {
            const allSelections = autoSelectedSeats.map((selectedSeat) => ({
                seat: {
                    ...selectedSeat,
                    // Ensure the seat has the correct structure for the API
                    row: selectedSeat.row,
                    col: selectedSeat.number, // API expects 'col' but our Seat type uses 'number'
                    class: selectedSeat.zone, // API expects 'class' but our Seat type uses 'zone'
                },
                ticketType: selectedSeat.ticketType,
                price: selectedSeat.price,
            }));
            
            // Use the visitor type from the first guest, or default to 'local'
            const primaryVisitorType = autoSelectedSeats[0]?.guestInfo?.visitorType === 'foreign' ? 'foreign' : 'local';
            
            console.log('Creating credit quote with:', {
                selections: allSelections,
                visitorType: primaryVisitorType,
                occurrenceId: selectedOccurrenceId
            });
            
            creditQuoteState.createQuote(
                allSelections,
                primaryVisitorType
            );
        }
        
        // Return the number of processed guests
        return numberOfGuests;
    };

    const getPageIcon = () => {
        switch (location.pathname) {
            case "/business/credits":
                return (
                    <CreditCard
                        className="w-8 h-8 text-amber-400"
                        strokeWidth={2}
                    />
                );
            case "/business/bookings":
                return (
                    <Calendar
                        className="w-8 h-8 text-amber-400"
                        strokeWidth={2}
                    />
                );
            case "/business/orders":
                return (
                    <Receipt
                        className="w-8 h-8 text-amber-400"
                        strokeWidth={2}
                    />
                );
            case "/business/settings":
                return (
                    <Settings
                        className="w-8 h-8 text-amber-400"
                        strokeWidth={2}
                    />
                );
            default:
                return (
                    <LayoutDashboard
                        className="w-8 h-8 text-amber-400"
                        strokeWidth={2}
                    />
                );
        }
    };

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/business/credits":
                return "Buy Credits";
            case "/business/bookings":
                return "Bookings";
            case "/business/orders":
                return "Order History";
            case "/business/settings":
                return "Settings";
            default:
                return "Dashboard";
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <Sidebar onLogout={handleLogout} />

            {/* Header with Welcome Message */}
            <div className="fixed top-0 left-64 right-0 h-24 bg-black z-0 flex items-center justify-end px-12">
                <div className="flex items-center gap-6">
                    <p className="text-white text-xl font-semibold tracking-wide">
                        {user.name}
                    </p>
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 backdrop-blur-xl border border-amber-500/20 flex items-center justify-center relative">
                            <span className="text-amber-400 font-medium text-base">
                                {user.initials}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Grey Panel */}
            <div className="ml-64 pt-24 relative z-10">
                <div className="min-h-[calc(100vh-6rem)] bg-[#737373]/10 backdrop-blur-md rounded-tl-[2rem] border-t border-l border-white/5 shadow-2xl">
                    <main className="p-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="h-full"
                        >
                            <div className="mb-12">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
                                        <div
                                            className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                      backdrop-blur-xl border border-amber-500/20 transition-colors duration-300"
                                        >
                                            {getPageIcon()}
                                        </div>
                                    </div>
                                    <h1 className="text-4xl font-semibold text-white tracking-wide">
                                        {getPageTitle()}
                                    </h1>
                                </div>
                                <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent" />
                            </div>

                            {/* Dashboard */}
                            {location.pathname === "/business" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <DashboardCharts />
                                    <DemographicCharts />
                                </motion.div>
                            )}

                            {/* Order History Tables */}
                            {location.pathname === "/business/orders" && (
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Ticket Orders Table */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.2,
                                        }}
                                        className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
                      hover:border-amber-500/20 transition-all duration-500 
                      hover:shadow-2xl hover:shadow-amber-500/5"
                                    >
                                        <div className="px-6 py-4 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
                                                    <div
                                                        className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                            backdrop-blur-xl border border-amber-500/20"
                                                    >
                                                        <Ticket
                                                            className="w-6 h-6 text-amber-400"
                                                            strokeWidth={2}
                                                        />
                                                    </div>
                                                </div>
                                                <h2 className="text-xl font-semibold text-amber-400">
                                                    Ticket Orders
                                                </h2>
                                            </div>
                                        </div>
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <CalendarDays className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Date
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <Ticket className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Tickets
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <Coins className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Credits
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ticketOrders.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                                                    >
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-white/80 text-xs">
                                                                {new Date(
                                                                    order.date
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-base font-semibold text-white">
                                                                {order.tickets.toLocaleString()}
                                                            </span>
                                                            <span className="text-white/60 text-xs ml-1">
                                                                tickets
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-base font-semibold text-white">
                                                                {order.credits.toLocaleString()}
                                                            </span>
                                                            <span className="text-white/60 text-xs ml-1">
                                                                credits
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    handleDownloadInvoice(
                                                                        order.id
                                                                    )
                                                                }
                                                                className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 
                                  backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 
                                  transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20
                                  group flex items-center gap-1.5"
                                                            >
                                                                <Download className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                                                                <span className="text-purple-400 text-xs font-medium">
                                                                    PDF
                                                                </span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </motion.div>

                                    {/* Credit Purchases Table */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.3,
                                        }}
                                        className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
                      hover:border-amber-500/20 transition-all duration-500 
                      hover:shadow-2xl hover:shadow-amber-500/5"
                                    >
                                        <div className="px-6 py-4 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
                                                    <div
                                                        className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                            backdrop-blur-xl border border-amber-500/20"
                                                    >
                                                        <Coins
                                                            className="w-6 h-6 text-amber-400"
                                                            strokeWidth={2}
                                                        />
                                                    </div>
                                                </div>
                                                <h2 className="text-xl font-semibold text-amber-400">
                                                    Credit Purchases
                                                </h2>
                                            </div>
                                        </div>
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <CalendarDays className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Date
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <Coins className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Credits
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <CreditCard className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Amount
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {creditPurchases.map(
                                                    (purchase) => (
                                                        <tr
                                                            key={purchase.id}
                                                            className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                                                        >
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="text-white/80 text-xs">
                                                                    {new Date(
                                                                        purchase.date
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="text-base font-semibold text-white">
                                                                    {purchase.credits.toLocaleString()}
                                                                </span>
                                                                <span className="text-white/60 text-xs ml-1">
                                                                    credits
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="text-base font-semibold text-amber-400">
                                                                    $
                                                                    {purchase.amount.toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() =>
                                                                        handleDownloadInvoice(
                                                                            purchase.id
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 
                                  backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 
                                  transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20
                                  group flex items-center gap-1.5"
                                                                >
                                                                    <Download className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                                                                    <span className="text-purple-400 text-xs font-medium">
                                                                        PDF
                                                                    </span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                </div>
                            )}

                            {/* Credits Table - Only show on credits page */}
                            {location.pathname === "/business/credits" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
                    hover:border-amber-500/20 transition-all duration-500 
                    hover:shadow-2xl hover:shadow-amber-500/5"
                                >
                                    {bundlesLoading ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
                                            <p className="text-white/60 mt-4">
                                                Loading credit bundles...
                                            </p>
                                        </div>
                                    ) : bundlesError ? (
                                        <div className="p-8 text-center">
                                            <p className="text-red-400">
                                                Failed to load credit bundles
                                            </p>
                                            <button
                                                onClick={() =>
                                                    window.location.reload()
                                                }
                                                className="mt-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : creditPackages.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-white/60">
                                                No credit bundles available
                                            </p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <Coins className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Credits
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <Clock className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Expiry
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <CreditCard className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Total Price
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="relative">
                                                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                                                <div
                                                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20"
                                                                >
                                                                    <Percent className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                            </div>
                                                            <span className="text-white/80 font-semibold text-sm">
                                                                Price Per Credit
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {creditPackages.map((pkg) => (
                                                    <tr
                                                        key={pkg.id}
                                                        className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                                                    >
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-2xl font-semibold text-white">
                                                                {pkg.credits}
                                                            </span>
                                                            <span className="text-white/60 ml-1">
                                                                credits
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-white/80">
                                                                {
                                                                    pkg.expiryMonths
                                                                }{" "}
                                                                months
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-2xl font-semibold text-amber-400">
                                                                {pkg.currency}{" "}
                                                                {pkg.price}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-white/80">
                                                                    {
                                                                        pkg.currency
                                                                    }{" "}
                                                                    {
                                                                        pkg.pricePerCredit
                                                                    }
                                                                    /credit
                                                                </span>
                                                                {pkg.discount >
                                                                    0 && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-medium">
                                                                        {
                                                                            pkg.discount
                                                                        }
                                                                        % OFF
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    handlePurchase(
                                                                        pkg.id,
                                                                        pkg.credits
                                                                    )
                                                                }
                                                                className="px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 
                                backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 
                                transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20
                                group flex items-center gap-2"
                                                            >
                                                                <Plus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                                                                <span className="text-emerald-400 font-medium">
                                                                    Buy
                                                                </span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </motion.div>
                            )}

                            {/* Bookings Interface - Only show on bookings page */}
                            {location.pathname === "/business/bookings" && (
                                <div className="w-full px-4 sm:px-6">
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Available Credits Display and Action Buttons */}
                                        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                                            <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl border border-amber-500/20 p-3 sm:flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Coins className="w-4 h-4 text-amber-400" />
                                                    <span className="text-white/90 text-sm">
                                                        Credits: {balance}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* <div className="flex gap-2">
                                                {(
                                                    [
                                                        "local",
                                                        "foreign",
                                                    ] as const
                                                ).map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() =>
                                                            setVisitorType(
                                                                type as UserType
                                                            )
                                                        }
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-xl border transition-all duration-300 ${
                                                            visitorType === type
                                                                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                                                                : "bg-gray-700/30 border-gray-700/50 text-white/60 hover:border-amber-500/20"
                                                        }`}
                                                    >
                                                        {type === "local"
                                                            ? "Local"
                                                            : "Tourist"}
                                                    </button>
                                                ))}
                                            </div> */}
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            "/business/credits"
                                                        )
                                                    }
                                                    className="px-3 py-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 
                              backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 
                              transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20
                              flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-emerald-400 text-sm font-medium whitespace-nowrap">
                                                        Buy Credits
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={
                                                        handleUploadGuestDetails
                                                    }
                                                    className="px-3 py-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 
                              backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 
                              transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20
                              flex items-center justify-center gap-2"
                                                >
                                                    <Upload className="w-4 h-4 text-purple-400" />
                                                    <span className="text-purple-400 text-sm font-medium whitespace-nowrap">
                                                        Upload Guest Details
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <DatePicker
                                                selectedDate={selectedDate}
                                                onDateSelect={setSelectedDate}
                                                availableDates={availableDates}
                                            />
                                            {isLoadingSchedule ? (
                                                <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl p-8 text-center border border-gray-700/20">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
                                                    <p className="text-white/60 mt-4">
                                                        Loading show times...
                                                    </p>
                                                </div>
                                            ) : scheduleError ? (
                                                <div className="bg-red-500/10 backdrop-blur-xl rounded-xl p-8 text-center border border-red-500/20">
                                                    <p className="text-red-400">
                                                        Failed to load show
                                                        times
                                                    </p>
                                                    <button
                                                        onClick={() =>
                                                            window.location.reload()
                                                        }
                                                        className="mt-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            ) : (
                                                <ShowTimeSelector
                                                    showTimes={
                                                        showTimesForSelectedDate
                                                    }
                                                    selectedOccurrenceId={
                                                        selectedOccurrenceId
                                                    }
                                                    onOccurrenceSelect={
                                                        setSelectedOccurrenceId
                                                    }
                                                    className="h-full"
                                                />
                                            )}
                                        </div>

                                        {selectedOccurrenceId && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-full"
                                            >
                                                <SeatMap
                                                    userType={visitorType}
                                                    onUserTypeChange={
                                                        setVisitorType
                                                    }
                                                    onSeatSelect={
                                                        handleSeatSelect
                                                    }
                                                    onSeatDeselect={
                                                        handleSeatRemove
                                                    }
                                                    selectedSeatIds={selectedSeats.map(
                                                        (seat) => seat.id
                                                    )}
                                                    selectedDate={selectedDate}
                                                    occurrenceId={
                                                        selectedOccurrenceId
                                                    }
                                                    useCredits={true}
                                                    creditCosts={
                                                        dynamicCreditCosts
                                                    }
                                                    findPrice={findPrice}
                                                />
                                            </motion.div>
                                        )}

                                        {/* Credit Quote Display */}
                                        {selectedSeats.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <CreditQuoteDisplay
                                                    quote={
                                                        creditQuoteState.quote
                                                    }
                                                    timeRemaining={
                                                        creditQuoteState.timeRemaining
                                                    }
                                                    isLoading={
                                                        creditQuoteState.isLoading
                                                    }
                                                    error={
                                                        creditQuoteState.error
                                                    }
                                                />
                                            </motion.div>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <TicketSummary
                                                key={`ticket-summary-${selectedSeats.length}-${selectedSeats.some(seat => seat.guestInfo) ? 'with-guests' : 'no-guests'}`}
                                                selectedSeats={selectedSeats}
                                                onRemoveSeat={handleSeatRemove}
                                                onProceedToCheckout={
                                                    handleProceedToCheckout
                                                }
                                                useCredits={true}
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </main>
                </div>
            </div>

            {/* Guest Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <GuestUploadModal
                        onClose={() => setShowUploadModal(false)}
                        onUpload={handleGuestFileUpload}
                    />
                )}
            </AnimatePresence>

            {/* Insufficient Credits Modal */}
            <AnimatePresence>
                {showInsufficientCreditsModal && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-24 left-64 right-0 z-50 flex justify-end px-12"
                    >
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-lg blur-xl opacity-50"></div>
                            <div
                                className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-xl 
                border border-emerald-500/20 rounded-lg p-4 relative flex items-center gap-3"
                            >
                                <div className="bg-emerald-500/20 rounded-full p-1">
                                    <AlertTriangle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-emerald-400 font-medium">
                                        Insufficient Credits
                                    </p>
                                    <p className="text-emerald-400/80 text-sm">
                                        You do not have enough credits to
                                        proceed with this booking.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default BusinessPortal;
