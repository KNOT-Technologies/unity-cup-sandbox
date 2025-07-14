import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    CreditCard,
    Trash2,
    X,
    AlertCircle,
    Loader2,
    ShoppingCart,
    ZoomOut,
    ZoomIn,
    Maximize,
    RotateCcw,
} from "lucide-react";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";
import { getHoldToken } from "../../api/knot";
import { useToast } from "../../hooks/useToast";
import { calculatePrice } from "../../types/ticketTypes";
import SeatTicketTypeModal from "./SeatTicketTypeModal";
import useSeatsIOStyling from "../../hooks/useSeatsIOStyling";

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

// Basket component
const SeatsIOBasket: React.FC<{
    basket: SeatsIOBasket;
    onRemoveSeat: (seatId: string) => void;
    onClearAll: () => void;
    onCheckout: () => void;
    disabled?: boolean;
}> = ({ basket, onRemoveSeat, onClearAll, onCheckout, disabled = false }) => {
    const formatPrice = (price: number) => {
        // Return object with separate dollar sign and amount for flexible styling
        return {
            symbol: "$",
            amount: price.toFixed(2),
            full: `$${price.toFixed(2)}`,
        };
    };

    const totalPrice = formatPrice(basket.totalPrice);

    if (basket.items.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No seats selected</p>
                <p className="text-sm text-gray-500 mt-2">
                    Select seats from the chart to add them to your basket
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Selected Seats
                    </h3>
                    <div className="text-xs text-gray-400 mt-1">
                        Choose ticket type for each seat
                    </div>
                </div>
                <button
                    onClick={onClearAll}
                    disabled={disabled}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {basket.items.map((item) => {
                    const itemPrice = formatPrice(item.price);
                    return (
                        <div
                            key={item.seatId}
                            className="bg-gray-700 rounded-lg p-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                    <div className="text-white font-medium">
                                        {item.seatLabel}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-400 font-semibold">
                                        <span className="font-normal">
                                            {itemPrice.symbol}
                                        </span>
                                        <span className="font-bold">
                                            {itemPrice.amount}
                                        </span>
                                    </span>
                                    <button
                                        onClick={() =>
                                            onRemoveSeat(item.seatId)
                                        }
                                        disabled={disabled}
                                        className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                {item.ticketType.charAt(0).toUpperCase() +
                                    item.ticketType.slice(1)}{" "}
                                ticket
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-white">
                        Total
                    </span>
                    <span className="text-xl text-amber-400">
                        <span className="font-normal">{totalPrice.symbol}</span>
                        <span className="font-bold">{totalPrice.amount}</span>
                    </span>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={disabled || basket.items.length === 0}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CreditCard className="w-4 h-4" />
                    <span>
                        Pay{" "}
                        <span className="font-normal">{totalPrice.symbol}</span>
                        <span className="font-bold">{totalPrice.amount}</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

// Custom Tooltip Component
const CustomSeatTooltip: React.FC<{
    tooltip: {
        visible: boolean;
        seat: SeatsIOSeat | null;
        position: { x: number; y: number };
    };
}> = ({ tooltip }) => {
    if (!tooltip.visible || !tooltip.seat) return null;

    const formatPrice = (price: number) => {
        // Return object with separate dollar sign and amount for flexible styling
        return {
            symbol: "$",
            amount: price.toFixed(2),
            full: `$${price.toFixed(2)}`,
        };
    };

    // Parse seat information for better UX
    const parseSeatInfo = (seatLabel: string) => {
        // Common patterns: "A-1", "Section A Row 1 Seat 6", "h3-X-6", etc.

        // Try pattern: "h3-X-6" (section-row-seat)
        const pattern1 = seatLabel.match(
            /^([a-zA-Z0-9]+)-([a-zA-Z0-9]+)-([a-zA-Z0-9]+)$/
        );
        if (pattern1) {
            return {
                section: pattern1[1],
                row: pattern1[2],
                seat: pattern1[3],
            };
        }

        // Try pattern: "A-1" (row-seat)
        const pattern2 = seatLabel.match(/^([a-zA-Z]+)-?(\d+)$/);
        if (pattern2) {
            return {
                section: null,
                row: pattern2[1],
                seat: pattern2[2],
            };
        }

        // Try pattern: "Section A Row 1 Seat 6"
        const pattern3 = seatLabel.match(
            /Section\s+([a-zA-Z0-9]+)\s+Row\s+([a-zA-Z0-9]+)\s+Seat\s+([a-zA-Z0-9]+)/i
        );
        if (pattern3) {
            return {
                section: pattern3[1],
                row: pattern3[2],
                seat: pattern3[3],
            };
        }

        // Try to extract row and seat from simple formats
        const pattern4 = seatLabel.match(/^([a-zA-Z]+)(\d+)$/);
        if (pattern4) {
            return {
                section: null,
                row: pattern4[1],
                seat: pattern4[2],
            };
        }

        // Default: treat the whole label as seat
        return {
            section: null,
            row: null,
            seat: seatLabel,
        };
    };

    const seatInfo = parseSeatInfo(tooltip.seat.label);
    const priceInfo = formatPrice(tooltip.seat.price);

    // Get status styling
    const getStatusInfo = (status: string) => {
        switch (status) {
            case "available":
                return {
                    color: "text-green-400",
                    bg: "bg-green-400/10",
                    text: "Available",
                    icon: "✓",
                };
            case "selected":
                return {
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                    text: "Selected",
                    icon: "★",
                };
            case "unavailable":
                return {
                    color: "text-red-400",
                    bg: "bg-red-400/10",
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

    const statusInfo = getStatusInfo(tooltip.seat.status);

    return (
        <div
            className="fixed z-50 pointer-events-none custom-tooltip"
            style={{
                left: tooltip.position.x,
                top: tooltip.position.y - 100,
                transform: "translateX(-50%)",
            }}
        >
            <div className="bg-gray-900/95 rounded-lg p-4 border border-gray-700 shadow-xl backdrop-blur-sm min-w-[200px]">
                {/* Header with seat type */}
                <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-semibold text-sm">
                        {tooltip.seat.seatType === "seat"
                            ? "🪑 Seat"
                            : tooltip.seat.seatType === "table"
                            ? "🪑 Table"
                            : tooltip.seat.seatType === "booth"
                            ? "🛋️ Booth"
                            : "🎫 General"}
                    </div>
                    <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}
                    >
                        <span>{statusInfo.icon}</span>
                        {statusInfo.text}
                    </div>
                </div>

                {/* Location Information */}
                <div className="space-y-2 mb-3">
                    {seatInfo.section && (
                        <div className="flex items-center gap-2">
                            <div className="text-gray-400 text-xs w-12 flex-shrink-0">
                                Section
                            </div>
                            <div className="text-white font-medium text-sm">
                                {seatInfo.section}
                            </div>
                        </div>
                    )}
                    {seatInfo.row && (
                        <div className="flex items-center gap-2">
                            <div className="text-gray-400 text-xs w-12 flex-shrink-0">
                                Row
                            </div>
                            <div className="text-white font-medium text-sm">
                                {seatInfo.row}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="text-gray-400 text-xs w-12 flex-shrink-0">
                            Seat
                        </div>
                        <div className="text-white font-medium text-sm">
                            {seatInfo.seat}
                        </div>
                    </div>
                </div>

                {/* Category and Price */}
                <div className="border-t border-gray-700 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-xs">Category</div>
                        <div className="text-white text-sm font-medium">
                            {tooltip.seat.category}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-xs">Price</div>
                        <div className="text-amber-400 text-sm">
                            <span className="font-normal">
                                {priceInfo.symbol}
                            </span>
                            <span className="font-bold">
                                {priceInfo.amount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action hint */}
                {tooltip.seat.status === "available" && (
                    <div className="border-t border-gray-700 pt-2 mt-3">
                        <div className="text-gray-500 text-xs text-center">
                            Click to select ticket type
                        </div>
                    </div>
                )}
            </div>

            {/* Tooltip arrow */}
            <div
                className="absolute left-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"
                style={{ transform: "translateX(-50%)" }}
            ></div>
        </div>
    );
};

// Main component
const SeatsIoChart: React.FC<SeatsIoChartProps> = ({
    eventKey,
    onSelect,
    onDeselect,
    onCheckout,
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

    // Add custom tooltip state after other state declarations
    const [customTooltip, setCustomTooltip] = useState<{
        visible: boolean;
        seat: SeatsIOSeat | null;
        position: { x: number; y: number };
    }>({
        visible: false,
        seat: null,
        position: { x: 0, y: 0 },
    });

    const chartRef = useRef<SeatsIOChartWithZoom | null>(null);
    const { showError } = useToast();

    // Custom styling hook for SeatsIO
    const containerRef = useSeatsIOStyling({
        height: "580px",
        width: "752px",
        left: "-59px",
        top: "-20px",
        perspectiveXCenter: "50.0000%",
        touchAction: "auto",
        userSelect: "none",
        cursor: "pointer",
        clipPath: "inset(20px 20px 20px 20px)",
    });

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
    const convertToSeatsIOSeat = useCallback((obj: any): SeatsIOSeat => {
        const category = obj.category?.label || obj.category || "Regular";
        const basePrice = getCategoryBasePrice(category);

        console.log("🎯 Converting seat:", {
            id: obj.id,
            category,
            basePrice,
            seatsIoPrice: obj.pricing?.price,
        });

        return {
            id: obj.id || obj.label,
            label: obj.labels?.displayedLabel || obj.label || obj.id,
            category: category,
            price: basePrice, // Use our base price instead of seats.io price
            status: obj.status || "available",
            seatType: obj.objectType || "seat",
            ticketType: "adult", // Default to adult ticket type
        };
    }, []);

    // Update basket when selected seats change
    useEffect(() => {
        const items = selectedSeats.map((seat) => {
            const ticketType = seat.ticketType || "adult"; // Default to adult
            const adjustedPrice = calculatePrice(seat.price, ticketType);
            return {
                seatId: seat.id,
                seatLabel: seat.label,
                category: seat.category,
                price: adjustedPrice,
                basePrice: seat.price,
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

            const category =
                object.category?.label || object.category || "Regular";
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
                '[class*="tooltip"]',
                '[class*="popover"]',
                '[class*="Tooltip"]',
                '[class*="Popover"]',
                'div[id*="tooltip"]',
                'div[id*="popover"]',
                ".react-tooltip",
            ];

            tooltipSelectors.forEach((selector) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el) => {
                    if (!el.classList.contains("custom-tooltip")) {
                        (el as HTMLElement).style.display = "none";
                        (el as HTMLElement).style.opacity = "0";
                        (el as HTMLElement).style.visibility = "hidden";
                        (el as HTMLElement).style.pointerEvents = "none";
                    }
                });
            });
        };

        // Remove tooltips immediately and set up periodic cleanup
        removeTooltips();
        const interval = setInterval(removeTooltips, 100);

        // Cleanup interval after 5 seconds (tooltips should be stable by then)
        setTimeout(() => clearInterval(interval), 5000);

        setIsLoading(false);
    }, []);

    // Zoom control functions
    const handleZoomOut = useCallback(() => {
        if (chartRef.current) {
            try {
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

    const handleZoomIn = useCallback(() => {
        if (chartRef.current) {
            try {
                // Zoom in by increasing the zoom level
                if (chartRef.current.zoom) {
                    const currentZoom = chartRef.current.zoomLevel || 1;
                    chartRef.current.zoom(currentZoom * 1.5);
                    console.log("🔍 Zoomed in");
                } else {
                    console.warn("⚠️ zoom method not available");
                }
            } catch (error) {
                console.warn("⚠️ Error zooming in:", error);
            }
        }
    }, []);

    const handleResetView = useCallback(() => {
        if (chartRef.current) {
            try {
                // Reset to original view
                if (chartRef.current.zoomToFit) {
                    chartRef.current.zoomToFit();
                }
                if (chartRef.current.clearSelection) {
                    chartRef.current.clearSelection();
                }
                console.log("🔄 View reset");
            } catch (error) {
                console.warn("⚠️ Error resetting view:", error);
            }
        }
    }, []);

    const handleFitToSelection = useCallback(() => {
        if (chartRef.current && selectedSeats.length > 0) {
            try {
                // Zoom to selected seats
                if (chartRef.current.zoomToObjects) {
                    const seatIds = selectedSeats.map((seat) => seat.id);
                    chartRef.current.zoomToObjects(seatIds);
                    console.log("🎯 Zoomed to selection");
                } else {
                    console.warn("⚠️ zoomToObjects method not available");
                }
            } catch (error) {
                console.warn("⚠️ Error zooming to selection:", error);
            }
        } else {
            console.warn("⚠️ No seats selected to zoom to");
        }
    }, [selectedSeats]);

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
                price: modalSeat.basePrice,
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
            console.log("🧪 Test mode: simulating checkout");
            const totalPrice = selectedSeats.reduce(
                (sum, seat) => sum + seat.price,
                0
            );
            showError(
                `Test Mode: Would checkout ${
                    selectedSeats.length
                } seat(s) for $${totalPrice.toFixed(2)}`
            );
            return;
        }

        if (!holdToken) {
            console.warn("⚠️ No hold token available for checkout");
            showError("Hold token is required for checkout");
            return;
        }

        onCheckout?.(selectedSeats, holdToken);
    }, [selectedSeats, holdToken, onCheckout, showError, testMode]);

    // Add custom hover handlers after other handlers
    const handleObjectMouseOver = useCallback(
        (object: any) => {
            const seat = convertToSeatsIOSeat(object);
            // Get mouse position from the chart container
            const container = containerRef.current;
            if (container) {
                const rect = container.getBoundingClientRect();
                setCustomTooltip({
                    visible: true,
                    seat: seat,
                    position: {
                        x: rect.left + rect.width / 2,
                        y: rect.top + 50,
                    },
                });
            }
        },
        [convertToSeatsIOSeat]
    );

    const handleObjectMouseOut = useCallback(() => {
        setCustomTooltip({
            visible: false,
            seat: null,
            position: { x: 0, y: 0 },
        });
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
                        <code className="text-amber-400 text-sm">
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
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
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
        <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
            {/* Chart Container */}
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button
                        onClick={handleZoomOut}
                        disabled={isLoading}
                        className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 hover:border-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom to Fit"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        disabled={isLoading}
                        className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 hover:border-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleFitToSelection}
                        disabled={isLoading || selectedSeats.length === 0}
                        className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 hover:border-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom to Selection"
                    >
                        <Maximize className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleResetView}
                        disabled={isLoading}
                        className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 hover:border-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reset View"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <div
                    ref={containerRef}
                    className="h-[600px] relative"
                    style={{
                        clipPath: "inset(18px 60px 18px 60px)",
                        backgroundImage:
                            "url(https://upload.wikimedia.org/wikipedia/commons/5/50/Black_colour.jpg) repeat",
                    }}
                >
                    <SeatsioSeatingChart
                        workspaceKey={environment.publicKey!}
                        event={eventKey}
                        holdToken={holdToken || undefined}
                        region={region as any}
                        pricing={{
                            prices: [
                                { category: "Regular", price: 25 },
                                { category: "VIP", price: 50 },
                            ],
                            priceFormatter: (price) => `$${price.toFixed(2)}`,
                            showSectionPricingOverlay: true,
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
                    />
                </div>
            </div>

            {/* Sidebar with Basket */}
            <div className="w-full lg:w-80 flex-shrink-0">
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

            {/* Custom Tooltip Component */}
            <CustomSeatTooltip tooltip={customTooltip} />
        </div>
    );
};

export default SeatsIoChart;
