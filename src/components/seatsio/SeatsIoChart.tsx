import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    CreditCard,
    Trash2,
    X,
    AlertCircle,
    Loader2,
    ShoppingCart,
    ZoomOut,
} from "lucide-react";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";
import { getHoldToken } from "../../api/knot";
import { useToast } from "../../hooks/useToast";
import SeatTicketTypeModal from "./SeatTicketTypeModal";
import { parseSeatInfo } from "../../utils/seatParser";
import { formatPrice } from "../../utils/priceFormatter";

// Types - SeatsIO Chart with zoom methods
interface SeatsIOChartWithZoom {
    zoomToFit?: () => void;
    zoom?: (level: number) => void;
    zoomToObjects?: (objectIds: string[]) => void;
    clearSelection?: () => void;
    deselectObjects?: (objectIds: string[]) => void;
    selectObjects?: (objectIds: string[]) => void;
    zoomLevel?: number;
    // Include any other methods we might need
    [key: string]: unknown;
}

interface SeatsIOSeat {
    id: string;
    label: string;
    category: string;
    price: number;
    status: "available" | "unavailable" | "selected";
    seatType: "seat" | "table" | "booth" | "generalAdmission";
    ticketType?: string; // Add ticket type per seat
}

interface SeatsIOBasketItem {
    seatId: string;
    seatLabel: string;
    category: string;
    price: number;
    basePrice: number; // Store base price separately
    ticketType: string; // Store ticket type per seat
}

interface SeatsIOBasket {
    items: SeatsIOBasketItem[];
    totalPrice: number;
    currency: string;
}

interface SeatsIoChartProps {
    eventKey: string;
    onSelect?: (seat: SeatsIOSeat) => void;
    onDeselect?: (seat: SeatsIOSeat) => void;
    onCheckout?: (selectedSeats: SeatsIOSeat[], holdToken: string) => void;
    onTooltipChange?: (tooltip: {
        visible: boolean;
        seat: SeatsIOSeat | null;
        position: { x: number; y: number };
    }) => void;
    className?: string;
    // Add test mode props
    testMode?: boolean;
    region?: string;
}

// Environment validation
const getSeatsIOEnvironment = () => {
    const publicKey = import.meta.env.VITE_SEATS_PUBLIC_KEY;

    if (!publicKey) {
        return {
            publicKey: null,
            isValid: false,
            error: "VITE_SEATS_PUBLIC_KEY environment variable is not set",
        };
    }

    return {
        publicKey,
        isValid: true,
        error: null,
    };
};

// Basket component with improved styling
const SeatsIOBasket: React.FC<{
    basket: SeatsIOBasket;
    onRemoveSeat: (seatId: string) => void;
    onClearAll: () => void;
    onCheckout: () => void;
    disabled?: boolean;
}> = ({ basket, onRemoveSeat, onClearAll, onCheckout, disabled = false }) => {
    const formatPriceObject = (price: number) => {
        return {
            symbol: "£",
            amount: formatPrice(price),
            full: `£${formatPrice(price)}`,
        };
    };

    const totalPrice = formatPriceObject(basket.totalPrice);

    if (basket.items.length === 0) {
        return (
            <div className="relative overflow-hidden">
                {/* Content */}
                <div className="relative p-5 rounded-3xl text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">
                        No seats selected
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Select seats from the chart to add them to your basket
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden">
            {/* Content */}
            <div className="relative pt-5 pr-5 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-medium text-white tracking-wide">
                            Selected Seats
                        </h3>
                        <div className="text-sm text-gray-400 mt-1">
                            Choose ticket type for each seat
                        </div>
                    </div>
                    <button
                        onClick={onClearAll}
                        disabled={disabled}
                        className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full hover:bg-blue-400/10 transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto">
                    {basket.items.map((item) => {
                        const itemPrice = formatPriceObject(item.price);
                        const seatInfo = parseSeatInfo(item.seatLabel);

                        return (
                            <div
                                key={item.seatId}
                                className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-white/5"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-400">
                                            {item.ticketType
                                                .charAt(0)
                                                .toUpperCase() +
                                                item.ticketType.slice(1)}{" "}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-blue-400 font-medium text-lg">
                                            <span className="font-normal">
                                                {itemPrice.symbol}
                                            </span>
                                            <span className="font-medium">
                                                {itemPrice.amount}
                                            </span>
                                        </span>
                                        <button
                                            onClick={() =>
                                                onRemoveSeat(item.seatId)
                                            }
                                            disabled={disabled}
                                            className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-full hover:bg-blue-400/10 transition-all"
                                        >
                                            <X
                                                className="w-5 h-5 text-gray-400 hover:text-white"
                                                style={{
                                                    position: "absolute",
                                                    top: "10px",
                                                    right: "10px",
                                                }}
                                            />
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        {seatInfo.section && (
                                            <>
                                                <span>
                                                    Section {seatInfo.section}
                                                </span>
                                                {seatInfo.row && <span>•</span>}
                                            </>
                                        )}
                                        {seatInfo.row && (
                                            <>
                                                <span>Row {seatInfo.row}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        <span>Seat {seatInfo.seat}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-white/20 pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-xl font-medium text-white">
                            Total
                        </span>
                        <span className="text-2xl text-blue-400">
                            <span className="font-normal">
                                {totalPrice.symbol}
                            </span>
                            <span className="font-medium">
                                {totalPrice.amount}
                            </span>
                        </span>
                    </div>

                    <button
                        onClick={onCheckout}
                        disabled={disabled || basket.items.length === 0}
                        className="w-full bg-white text-black font-medium py-4 px-6 rounded-full transition-all duration-300 disabled:bg-gray-800 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center justify-center gap-3"
                    >
                        <CreditCard className="w-5 h-5" />
                        <span>
                            Pay{" "}
                            <span className="font-normal">
                                {totalPrice.symbol}
                            </span>
                            <span className="font-medium">
                                {totalPrice.amount}
                            </span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Improved Custom Tooltip Component - Export for use in SeatsIOPage
export const CustomSeatTooltip: React.FC<{
    tooltip: {
        visible: boolean;
        seat: SeatsIOSeat | null;
        position: { x: number; y: number };
    };
}> = ({ tooltip }) => {
    const formatPriceObject = (price: number) => {
        return {
            symbol: "£",
            amount: formatPrice(price),
            full: `£${formatPrice(price)}`,
        };
    };

    // Get status styling
    const getStatusInfo = (status: string) => {
        switch (status) {
            case "available":
                return {
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                    text: "Available",
                    icon: "✓",
                };
            case "selected":
                return {
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                    text: "Selected",
                    icon: "★",
                };
            case "unavailable":
                return {
                    color: "text-gray-400",
                    bg: "bg-gray-400/10",
                    text: "Unavailable",
                    icon: "✕",
                };
            default:
                return {
                    color: "text-gray-400",
                    bg: "bg-gray-400/10",
                    text: status,
                    icon: "●",
                };
        }
    };

    return (
        <div
            className="w-1/2 custom-tooltip mx-auto"
            style={{
                pointerEvents: "none",
            }}
        >
            <div className="relative overflow-hidden">
                {/* Content */}
                <div className="relative rounded-3xl p-6">
                    {tooltip.visible && tooltip.seat ? (
                        <>
                            {/* Parse seat info */}
                            {(() => {
                                const seatInfo = parseSeatInfo(
                                    tooltip.seat.label
                                );
                                const priceInfo = formatPriceObject(
                                    tooltip.seat.price
                                );
                                const statusInfo = getStatusInfo(
                                    tooltip.seat.status
                                );

                                return (
                                    <div className="flex items-center gap-8">
                                        {/* Left: Seat Icon and Basic Info */}
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h3 className="text-white font-medium text-lg tracking-wide mb-1">
                                                    Seat Information
                                                </h3>
                                                <div
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color} flex items-center gap-2 w-fit`}
                                                >
                                                    <span>
                                                        {statusInfo.icon}
                                                    </span>
                                                    {statusInfo.text}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center: Location Details */}
                                        <div className="flex items-center gap-6">
                                            {seatInfo.section && (
                                                <div className="text-center">
                                                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                                        Section
                                                    </div>
                                                    <div className="text-white font-medium">
                                                        {seatInfo.section}
                                                    </div>
                                                </div>
                                            )}
                                            {seatInfo.row && (
                                                <div className="text-center">
                                                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                                        Row
                                                    </div>
                                                    <div className="text-white font-medium">
                                                        {seatInfo.row}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                                    Seat
                                                </div>
                                                <div className="text-white font-medium">
                                                    {seatInfo.seat}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                                    Category
                                                </div>
                                                <div className="text-white font-medium">
                                                    {tooltip.seat.category}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Price and Action */}
                                        <div className="ml-auto flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                                    Price
                                                </div>
                                                <div className="text-blue-400 font-medium text-xl">
                                                    <span className="font-normal">
                                                        {priceInfo.symbol}
                                                    </span>
                                                    <span className="font-medium">
                                                        {priceInfo.amount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    ) : (
                        <>
                            {/* Empty state - Horizontal layout */}
                            <div className="flex items-center justify-center gap-8 py-1">
                                <div className="text-center">
                                    <h3 className="text-white font-medium text-lg tracking-wide mb-1">
                                        Seat Information
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Hover over any seat to see details
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main component
const SeatsIoChart: React.FC<SeatsIoChartProps> = ({
    eventKey,
    onSelect,
    onDeselect,
    onCheckout,
    onTooltipChange,
    className = "",
    testMode = false,
    region = "eu",
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [holdToken, setHoldToken] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<SeatsIOSeat[]>([]);
    const [basket, setBasket] = useState<SeatsIOBasket>({
        items: [],
        totalPrice: 0,
        currency: "USD",
    });

    // Modal state for seat ticket type selection
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSeat, setModalSeat] = useState<{
        id: string;
        label: string;
        category: string;
        basePrice: number;
    } | null>(null);

    const chartRef = useRef<SeatsIOChartWithZoom | null>(null);
    const { showError } = useToast();

    // Environment validation
    const environment = getSeatsIOEnvironment();

    // Fetch hold token on mount
    useEffect(() => {
        console.log("🚀 SeatsIoChart initializing with:", {
            eventKey,
            testMode,
            region,
            publicKey: environment.publicKey ? "Present" : "Missing",
        });

        const fetchHoldToken = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (testMode) {
                    console.log("🧪 Test mode: skipping hold token fetch");
                    setHoldToken(null);
                    setIsLoading(false);
                    return;
                }

                console.log("📡 Fetching hold token from backend...");
                const token = await getHoldToken();
                console.log("✅ Hold token received:", token);
                setHoldToken(token);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to get hold token";
                console.error("❌ Error fetching hold token:", errorMessage);
                setError(errorMessage);
                showError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        if (environment.isValid) {
            fetchHoldToken();
        } else {
            console.error("❌ Environment not valid:", environment.error);
            setError(environment.error || "Environment configuration error");
            setIsLoading(false);
        }
    }, [
        environment.isValid,
        environment.error,
        showError,
        eventKey,
        testMode,
        region,
    ]);

    // Base prices per category
    const getCategoryBasePrice = (category: string): number => {
        const basePrices: { [key: string]: number } = {
            Regular: 25,
            regular: 25,
            VIP: 50,
            vip: 50,
            General: 20,
            general: 20,
        };
        return basePrices[category] || 25; // Default to $25 if category not found
    };

    // Convert SelectableObject to SeatsIOSeat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const convertToSeatsIOSeat = useCallback((obj: any): SeatsIOSeat => {
        // Handle category - could be string or object with label
        let category: string;
        if (typeof obj.category === "string") {
            category = obj.category;
        } else if (
            obj.category &&
            typeof obj.category === "object" &&
            obj.category.label
        ) {
            category = obj.category.label;
        } else {
            category = "Regular";
        }

        const basePrice = getCategoryBasePrice(category);

        console.log("🎯 Converting seat:", {
            id: obj.id,
            category,
            basePrice,
            seatsIoPrice: obj.pricing?.price,
        });

        // Map status to our enum
        let status: "available" | "unavailable" | "selected" = "available";
        if (obj.status === "unavailable" || obj.status === "selected") {
            status = obj.status;
        }

        // Map seat type to our enum
        let seatType: "seat" | "table" | "booth" | "generalAdmission" = "seat";
        if (
            obj.objectType === "table" ||
            obj.objectType === "booth" ||
            obj.objectType === "generalAdmission"
        ) {
            seatType = obj.objectType;
        }

        return {
            id: obj.id || obj.label,
            label: obj.labels?.displayedLabel || obj.label || obj.id,
            category: category,
            price: basePrice, // Use our base price instead of seats.io price
            status: status,
            seatType: seatType,
            ticketType: "adult", // Default to adult ticket type
        };
    }, []);

    // Update basket when selected seats change
    useEffect(() => {
        const items = selectedSeats.map((seat) => {
            const ticketType = seat.ticketType || "adult"; // Default to adult
            // seat.price now already contains the calculated price, so use it directly
            return {
                seatId: seat.id,
                seatLabel: seat.label,
                category: seat.category,
                price: seat.price, // Use the already calculated price
                basePrice: getCategoryBasePrice(seat.category), // Calculate base price for display if needed
                ticketType: ticketType,
            };
        });

        const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

        setBasket({
            items,
            totalPrice,
            currency: "USD",
        });
    }, [selectedSeats]);

    // Handle seat selection - show modal for ticket type selection
    const handleObjectSelected = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (object: any) => {
            console.log("🎯 Seat clicked:", object);

            // Check if seat is already selected
            const isAlreadySelected = selectedSeats.some(
                (seat) => seat.id === (object.id || object.label)
            );
            if (isAlreadySelected) {
                console.log("🔄 Seat already selected, skipping modal");
                return;
            }

            // Handle category - could be string or object with label
            let category: string;
            if (typeof object.category === "string") {
                category = object.category;
            } else if (
                object.category &&
                typeof object.category === "object" &&
                object.category.label
            ) {
                category = object.category.label;
            } else {
                category = "Regular";
            }

            const basePrice = getCategoryBasePrice(category);

            // Show modal for ticket type selection
            setModalSeat({
                id: object.id || object.label,
                label:
                    object.labels?.displayedLabel || object.label || object.id,
                category: category,
                basePrice: basePrice,
            });
            setIsModalOpen(true);

            // Deselect the seat immediately (we'll add it properly when ticket type is chosen)
            if (chartRef.current && chartRef.current.deselectObjects) {
                setTimeout(() => {
                    chartRef.current!.deselectObjects!([
                        object.id || object.label,
                    ]);
                }, 100);
            }
        },
        [selectedSeats, getCategoryBasePrice]
    );

    // Handle seat deselection
    const handleObjectDeselected = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (object: any) => {
            console.log("❌ Seat deselected:", object);
            const seat = convertToSeatsIOSeat(object);
            setSelectedSeats((prev) => {
                const newSelection = prev.filter((s) => s.id !== seat.id);
                onDeselect?.(seat);
                return newSelection;
            });
        },
        [convertToSeatsIOSeat, onDeselect]
    );

    // Handle chart rendered
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChartRendered = useCallback((chart: any) => {
        console.log("🎉 SeatsIO chart rendered successfully", {
            chart,
            availableMethods: Object.getOwnPropertyNames(chart),
            zoomMethods: {
                zoomToFit: typeof chart.zoomToFit,
                zoom: typeof chart.zoom,
                zoomToObjects: typeof chart.zoomToObjects,
                fitToChart: typeof chart.fitToChart,
                resetView: typeof chart.resetView,
            },
        });
        chartRef.current = chart as SeatsIOChartWithZoom;

        // Aggressively remove any SeatsIO tooltips that appear
        const removeTooltips = () => {
            const tooltipSelectors = [
                ".seatsio-tooltip",
                ".seatsio-popover",
                ".seatsio-object-tooltip",
                ".seatsio-seat-tooltip",
                '[class*="tooltip"]',
                '[class*="popover"]',
                '[class*="Tooltip"]',
                '[class*="Popover"]',
                'div[id*="tooltip"]',
                'div[id*="popover"]',
                ".react-tooltip",
                "[data-tooltip]",
                "[title]:not(.custom-tooltip *)", // Remove title attributes that create browser tooltips
            ];

            tooltipSelectors.forEach((selector) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el) => {
                    if (
                        !el.classList.contains("custom-tooltip") &&
                        !el.closest(".custom-tooltip")
                    ) {
                        (el as HTMLElement).style.display = "none !important";
                        (el as HTMLElement).style.opacity = "0 !important";
                        (el as HTMLElement).style.visibility =
                            "hidden !important";
                        (el as HTMLElement).style.pointerEvents =
                            "none !important";
                        (el as HTMLElement).style.zIndex = "-1 !important";
                        // Remove title attribute to prevent browser tooltips
                        if (el.hasAttribute("title")) {
                            el.removeAttribute("title");
                        }
                    }
                });
            });

            // Inject CSS to completely disable SeatsIO tooltips
            const existingStyle = document.getElementById(
                "disable-seatsio-tooltips"
            );
            if (!existingStyle) {
                const style = document.createElement("style");
                style.id = "disable-seatsio-tooltips";
                style.textContent = `
                    /* Completely disable all SeatsIO tooltips */
                    .seatsio-tooltip,
                    .seatsio-popover,
                    .seatsio-object-tooltip,
                    .seatsio-seat-tooltip,
                    [class*="tooltip"]:not(.custom-tooltip):not(.custom-tooltip *),
                    [class*="popover"]:not(.custom-tooltip):not(.custom-tooltip *),
                    [class*="Tooltip"]:not(.custom-tooltip):not(.custom-tooltip *),
                    [class*="Popover"]:not(.custom-tooltip):not(.custom-tooltip *) {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                        z-index: -1 !important;
                        transform: scale(0) !important;
                    }
                    
                    /* Prevent any hover effects that might trigger tooltips */
                    .seatsio-chart * {
                        pointer-events: auto !important;
                    }
                    
                    /* Ensure our custom tooltip is always on top */
                    .custom-tooltip {
                        position: relative !important;
                        pointer-events: none !important;
                    }
                `;
                document.head.appendChild(style);
            }
        };

        // Remove tooltips immediately and set up periodic cleanup
        removeTooltips();
        const interval = setInterval(removeTooltips, 50); // More frequent cleanup

        // Cleanup interval after 10 seconds (should be stable by then)
        setTimeout(() => clearInterval(interval), 10000);

        setIsLoading(false);
    }, []);

    // Zoom control functions
    const handleZoomOut = useCallback(() => {
        if (chartRef.current) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const chart = chartRef.current as any;
                console.log(
                    "🔍 Attempting zoom out, available methods:",
                    Object.getOwnPropertyNames(chart)
                );

                // Try multiple zoom methods
                if (chart.zoomToFit) {
                    chart.zoomToFit();
                    console.log("✅ Zoomed to fit using zoomToFit()");
                } else if (chart.fitToChart) {
                    chart.fitToChart();
                    console.log("✅ Zoomed to fit using fitToChart()");
                } else if (chart.resetView) {
                    chart.resetView();
                    console.log("✅ Reset view using resetView()");
                } else if (chart.zoom) {
                    chart.zoom(0.8); // Try zooming out
                    console.log("✅ Zoomed out using zoom(0.8)");
                } else {
                    console.warn("⚠️ No zoom methods available");
                }
            } catch (error) {
                console.warn("⚠️ Error zooming out:", error);
            }
        }
    }, []);

    // Remove seat from basket
    const handleRemoveSeat = useCallback((seatId: string) => {
        if (chartRef.current && chartRef.current.deselectObjects) {
            chartRef.current.deselectObjects([seatId]);
        }
    }, []);

    // Clear all selections
    const handleClearAll = useCallback(() => {
        if (chartRef.current && chartRef.current.clearSelection) {
            chartRef.current.clearSelection();
        }
        setSelectedSeats([]);
    }, []);

    // Handle ticket type selection from modal
    const handleModalTicketTypeSelect = useCallback(
        (seatId: string, ticketType: string, finalPrice: number) => {
            console.log("🎫 Adding seat with ticket type:", {
                seatId,
                ticketType,
                finalPrice,
            });

            if (!modalSeat) return;

            const newSeat: SeatsIOSeat = {
                id: seatId,
                label: modalSeat.label,
                category: modalSeat.category,
                price: finalPrice, // Use the calculated final price instead of base price
                status: "selected",
                seatType: "seat",
                ticketType: ticketType,
            };

            setSelectedSeats((prev) => [...prev, newSeat]);
            onSelect?.(newSeat);

            // Select the seat in the chart
            if (chartRef.current && chartRef.current.selectObjects) {
                setTimeout(() => {
                    chartRef.current!.selectObjects!([seatId]);
                }, 100);
            }
        },
        [modalSeat, onSelect]
    );

    // Handle closing the modal
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setModalSeat(null);
    }, []);

    // Handle checkout
    const handleCheckout = useCallback(() => {
        console.log("🛒 Checkout clicked with selected seats:", selectedSeats);

        if (selectedSeats.length === 0) {
            console.warn("⚠️ No seats selected for checkout");
            showError("Please select at least one seat");
            return;
        }

        if (testMode) {
            console.log("🧪 Test mode: proceeding with demo checkout");
            // In test mode, we still want to proceed with the checkout for demo purposes
            onCheckout?.(selectedSeats, holdToken || "demo-hold-token");
            return;
        }

        if (!holdToken) {
            console.warn("⚠️ No hold token available for checkout");
            showError("Hold token is required for checkout");
            return;
        }

        onCheckout?.(selectedSeats, holdToken);
    }, [selectedSeats, holdToken, onCheckout, showError, testMode]);

    // Add stable tooltip state management to prevent flickering
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentHoveredSeatRef = useRef<string | null>(null);
    const isTooltipStableRef = useRef<boolean>(false);

    const handleObjectMouseOver = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (object: any) => {
            const seatId = object.id || object.label;

            // If we're already hovering this exact seat, don't do anything
            if (
                currentHoveredSeatRef.current === seatId &&
                isTooltipStableRef.current
            ) {
                return;
            }

            // Clear any pending hide timeout
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }

            // Clear any pending hover timeout
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }

            // Update current hovered seat immediately to prevent duplicate events
            currentHoveredSeatRef.current = seatId;

            // Debounce the tooltip update with longer delay for stability
            hoverTimeoutRef.current = setTimeout(() => {
                try {
                    const seat = convertToSeatsIOSeat(object);
                    const tooltipData = {
                        visible: true,
                        seat: seat,
                        position: { x: 0, y: 0 },
                    };
                    onTooltipChange?.(tooltipData);
                    isTooltipStableRef.current = true;
                } catch (error) {
                    console.warn("Error updating tooltip:", error);
                }
            }, 150); // Increased debounce to 150ms for stability
        },
        [convertToSeatsIOSeat]
    );

    const handleObjectMouseOut = useCallback(() => {
        // Clear any pending hover timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Set up a delay before hiding to prevent flicker when moving between seats
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = setTimeout(() => {
            currentHoveredSeatRef.current = null;
            isTooltipStableRef.current = false;
            const tooltipData = {
                visible: false,
                seat: null,
                position: { x: 0, y: 0 },
            };
            onTooltipChange?.(tooltipData);
        }, 200); // Longer delay before hiding to prevent flicker
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    // Environment error display
    if (!environment.isValid) {
        return (
            <div
                className={`flex items-center justify-center min-h-[400px] ${className}`}
            >
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Configuration Error
                    </h3>
                    <p className="text-red-400 mb-4">{environment.error}</p>
                    <div className="bg-gray-800 rounded-lg p-4 text-left">
                        <p className="text-sm text-gray-300 mb-2">
                            To fix this, add your seats.io public key to your
                            environment variables:
                        </p>
                        <code className="text-blue-400 text-sm">
                            VITE_SEATS_PUBLIC_KEY=your_public_key_here
                        </code>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div
                className={`flex items-center justify-center min-h-[400px] ${className}`}
            >
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading seating chart...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div
                className={`flex items-center justify-center min-h-[400px] ${className}`}
            >
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Error Loading Chart
                    </h3>
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col lg:flex-row gap-6 ${className}`}
            style={{ isolation: "isolate" }}
        >
            {/* Chart Container */}
            <div
                className="order-2 lg:order-1 flex-1 relative overflow-hidden"
                style={{ isolation: "isolate" }}
            >
                {/* Zoom Controls */}
                <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                    <button
                        onClick={handleZoomOut}
                        disabled={isLoading}
                        className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom to Fit"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                </div>

                <div
                    className="h-[500px] sm:h-[600px] lg:h-[650px] relative rounded-3xl overflow-hidden min-w-[900px] max-w-[900px]"
                    style={{
                        clipPath: "inset(19px 60px 18px 60px)",
                        backgroundImage:
                            "url(https://upload.wikimedia.org/wikipedia/commons/5/50/Black_colour.jpg) repeat",
                        isolation: "isolate",
                    }}
                >
                    <SeatsioSeatingChart
                        workspaceKey={environment.publicKey!}
                        event={eventKey}
                        holdToken={holdToken || undefined}
                        region={region as "eu" | "na" | "sa" | "oc"}
                        pricing={{
                            prices: [
                                { category: "Regular", price: 25 },
                                { category: "VIP", price: 50 },
                            ],
                            priceFormatter: (price) => `$${formatPrice(price)}`,
                            showSectionPricingOverlay: false,
                        }}
                        // Disable default popover/tooltip completely
                        objectPopover={{
                            showAvailability: false,
                            showCategory: true,
                            showLabel: false,
                            showPricing: false,
                            showUnavailableNotice: false,
                            stylizedLabel: true,
                            confirmSelection: "never",
                            confirmTicketTypeSelection: false,
                        }}
                        onObjectSelected={handleObjectSelected}
                        onObjectDeselected={handleObjectDeselected}
                        onChartRendered={handleChartRendered}
                        onSessionInitialized={(holdToken) => {
                            console.log(
                                "🎯 Session initialized with hold token:",
                                holdToken.token
                            );
                            setHoldToken(holdToken.token);
                        }}
                        onObjectMouseOver={handleObjectMouseOver}
                        onObjectMouseOut={handleObjectMouseOut}
                        colorScheme="dark"
                        colors={{
                            selectedObjectColor: "#60A5FA",
                        }}
                        sectionColor={(section, defaultColor, extraConfig) => {
                            console.log("section", section);
                            console.log("defaultColor", defaultColor);
                            console.log("extraConfig", extraConfig);
                            return defaultColor;
                        }}
                    />
                </div>
            </div>

            {/* Sidebar with Basket */}
            <div
                className="order-3 lg:order-3 w-full lg:w-96 flex-shrink-0"
                style={{ isolation: "isolate", zIndex: 10 }}
            >
                <SeatsIOBasket
                    basket={basket}
                    onRemoveSeat={handleRemoveSeat}
                    onClearAll={handleClearAll}
                    onCheckout={handleCheckout}
                    disabled={isLoading}
                />
            </div>

            {/* Seat Ticket Type Selection Modal */}
            <SeatTicketTypeModal
                seat={modalSeat}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSelectTicketType={handleModalTicketTypeSelect}
            />
        </div>
    );
};

export default SeatsIoChart;
