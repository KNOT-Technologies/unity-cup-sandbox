import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Armchair } from "lucide-react";
import type { Seat, UserType, TicketType } from "../../types/tickets";
import { SeatStatus } from "../../types/tickets";
import TicketTypeModal from "./TicketTypeModal";
import { useSeatMap } from "../../hooks/useApi";

interface SeatMapProps {
    onSeatSelect: (seat: Seat, ticketType: TicketType) => void;
    onSeatDeselect?: (seatId: string) => void;
    occurrenceId?: string;
    selectedDate: Date;
    selectedShowTime?: string;
    userType: UserType;
    onUserTypeChange: (type: UserType) => void;
    selectedSeatIds?: string[];
    useCredits?: boolean;
    creditCosts?: {
        regular: {
            senior: number;
            adult: number;
            student: number;
            child: number;
        };
        vip: {
            senior: number;
            adult: number;
            student: number;
            child: number;
        };
    };
    findPrice: (
        userType: UserType,
        seatClass: "vip" | "regular",
        category: TicketType
    ) => number;
}

const SeatMap = ({
    onSeatSelect,
    onSeatDeselect,
    occurrenceId,
    selectedDate: _selectedDate, // eslint-disable-line @typescript-eslint/no-unused-vars
    selectedShowTime: _selectedShowTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    userType,
    onUserTypeChange,
    selectedSeatIds = [],
    useCredits = false,
    creditCosts,
    findPrice,
}: SeatMapProps) => {
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
    const [focusedSeat, setFocusedSeat] = useState<string | null>(null);
    const [selectedSeatForModal, setSelectedSeatForModal] =
        useState<Seat | null>(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [modalDirection, setModalDirection] = useState<"up" | "down">("up");
    const mapRef = useRef<HTMLDivElement>(null);

    // Fetch seat map from API
    const {
        seatMap,
        isLoading: isLoadingSeatMap,
        error: seatMapError,
    } = useSeatMap(occurrenceId || null);

    // Transform API seat map data to Seat[] format
    const seats: Seat[] = useMemo(() => {
        if (!seatMap) {
            // Return empty array if no API data - don't show fallback seats
            return [];
        }

        const transformedSeats: Seat[] = [];

        // Transform API grid to seats
        seatMap.grid.forEach(
            (gridSeat: {
                row: string;
                col: number;
                class: "vip" | "regular";
                _id: string;
            }) => {
                const seatId = `${gridSeat.row}-${gridSeat.col}`;
                const isUnavailable = seatMap.takenSeats.includes(seatId);
                const isSelected = selectedSeatIds.includes(seatId);

                transformedSeats.push({
                    id: seatId,
                    row: gridSeat.row,
                    number: gridSeat.col,
                    zone: gridSeat.class,
                    status: isSelected
                        ? SeatStatus.SELECTED
                        : isUnavailable
                        ? SeatStatus.UNAVAILABLE
                        : SeatStatus.AVAILABLE,
                });
            }
        );

        return transformedSeats;
    }, [seatMap, selectedSeatIds]);

    // Group seats dynamically by zone and row
    const seatLayout = useMemo(() => {
        const layout = {
            vip: {} as Record<string, Seat[]>,
            regular: {} as Record<string, Seat[]>,
        };

        seats.forEach((seat) => {
            if (!layout[seat.zone][seat.row]) {
                layout[seat.zone][seat.row] = [];
            }
            layout[seat.zone][seat.row].push(seat);
        });

        // Sort seats within each row by number
        Object.values(layout.vip).forEach((rowSeats) =>
            rowSeats.sort((a, b) => a.number - b.number)
        );
        Object.values(layout.regular).forEach((rowSeats) =>
            rowSeats.sort((a, b) => a.number - b.number)
        );

        // Calculate maximum seats per row for dynamic grid
        const allRows = [
            ...Object.values(layout.vip),
            ...Object.values(layout.regular),
        ];
        const maxSeatsInAnyRow = Math.max(
            0,
            ...allRows.map((row) => row.length)
        );

        return {
            vipRows: Object.keys(layout.vip).sort(),
            regularRows: Object.keys(layout.regular).sort(),
            vipSeats: layout.vip,
            regularSeats: layout.regular,
            maxSeatsPerRow: maxSeatsInAnyRow,
        };
    }, [seats]);

    const computeModalPosition = (
        rect: DOMRect,
        modalHeight = 500,
        margin = 12
    ) => {
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        let direction: "up" | "down";
        if (spaceBelow >= modalHeight + margin) {
            direction = "down";
        } else if (spaceAbove >= modalHeight + margin) {
            direction = "up";
        } else {
            // choose side with more space
            direction = spaceBelow > spaceAbove ? "down" : "up";
        }
        let y: number;
        if (direction === "down") {
            y = rect.bottom + margin;
            // adjust if overflow bottom
            if (y + modalHeight + margin > window.innerHeight) {
                y = window.innerHeight - modalHeight - margin;
            }
        } else {
            y = rect.top - modalHeight;
            // adjust if overflow top
            if (y < margin) {
                y = margin;
            }
        }
        return { direction, y } as const;
    };

    const handleSeatClick = (seat: Seat, event: React.MouseEvent) => {
        if (seat.status === SeatStatus.UNAVAILABLE) return;

        // If seat is already selected, deselect it
        if (seat.status === SeatStatus.SELECTED) {
            if (onSeatDeselect) {
                onSeatDeselect(seat.id);
            }
            return;
        }

        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const { direction, y } = computeModalPosition(rect);
        setModalDirection(direction);
        setModalPosition({
            x: rect.left + rect.width / 2,
            y: y,
        });
        setSelectedSeatForModal(seat);
    };

    const handleTicketTypeSelect = (ticketType: TicketType) => {
        if (selectedSeatForModal) {
            onSeatSelect(selectedSeatForModal, ticketType);
        }
        setSelectedSeatForModal(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent, seat: Seat) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (seat.status !== SeatStatus.UNAVAILABLE) {
                const target = e.target as HTMLElement;
                const rect = target.getBoundingClientRect();
                const { direction, y } = computeModalPosition(rect);
                setModalDirection(direction);
                setModalPosition({
                    x: rect.left + rect.width / 2,
                    y: y,
                });
                setSelectedSeatForModal(seat);
            }
        }
    };

    const getSeatColor = (seat: Seat) => {
        const baseColors = {
            vip: {
                available:
                    "bg-yellow-700/80 hover:bg-yellow-600 ring-2 ring-yellow-600/30 hover:ring-yellow-500/50",
                selected:
                    "bg-yellow-400 hover:bg-yellow-500 ring-2 ring-yellow-300/80 shadow-lg shadow-yellow-400/30",
                unavailable:
                    "bg-gray-600/80 cursor-not-allowed ring-1 ring-gray-500/30",
            },
            regular: {
                available:
                    "bg-blue-700/80 hover:bg-blue-600 ring-2 ring-blue-600/30 hover:ring-blue-500/50",
                selected:
                    "bg-blue-400 hover:bg-blue-500 ring-2 ring-blue-300/80 shadow-lg shadow-blue-400/30",
                unavailable:
                    "bg-gray-600/80 cursor-not-allowed ring-1 ring-gray-500/30",
            },
        };

        return baseColors[seat.zone][seat.status];
    };

    const renderSeatContent = (seat: Seat) => {
        if (seat.status === SeatStatus.SELECTED) {
            return (
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white stroke-[3]" />
            );
        }
        return null;
    };

    const renderSeatRow = (row: string, rowSeats: Seat[]) => {
        // Sort seats by number to ensure proper ordering
        const sortedSeats = rowSeats.sort((a, b) => a.number - b.number);
        const totalSeats = sortedSeats.length;

        // Calculate seats per side more intelligently
        const seatsPerSide = Math.ceil(totalSeats / 2);
        const firstHalf = sortedSeats.slice(0, seatsPerSide);
        const secondHalf = sortedSeats.slice(seatsPerSide);

        return (
            <div
                key={row}
                className="grid grid-cols-[32px_1fr] sm:grid-cols-[40px_1fr] gap-1 sm:gap-2 items-center"
            >
                <div className="flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 text-white/60 text-xs sm:text-sm font-medium bg-gray-800/30 rounded-lg sticky left-0 z-10">
                    {row}
                </div>

                {/* Desktop version */}
                <div className="hidden sm:flex items-center justify-center gap-1">
                    {/* First half container */}
                    <div
                        className="flex items-center justify-end gap-1"
                        style={{ minWidth: `${seatsPerSide * 28}px` }}
                    >
                        {firstHalf.map((seat) => (
                            <motion.button
                                key={seat.id}
                                onClick={(e) => handleSeatClick(seat, e)}
                                onKeyDown={(e) => handleKeyPress(e, seat)}
                                onMouseEnter={() => setHoveredSeat(seat.id)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                onFocus={() => setFocusedSeat(seat.id)}
                                onBlur={() => setFocusedSeat(null)}
                                className={`
                                    w-6 h-6 rounded-full flex items-center justify-center
                                    transition-all duration-300 relative group
                                    ${getSeatColor(seat)}
                                    ${
                                        hoveredSeat === seat.id ||
                                        focusedSeat === seat.id
                                            ? "scale-125 z-10"
                                            : ""
                                    }
                                `}
                                aria-label={`Row ${seat.row}, Seat ${seat.number} (${seat.zone} zone)`}
                            >
                                {renderSeatContent(seat)}

                                <AnimatePresence>
                                    {(hoveredSeat === seat.id ||
                                        focusedSeat === seat.id) &&
                                        seat.status !==
                                            SeatStatus.UNAVAILABLE && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none"
                                            >
                                                Row {seat.row}, Seat{" "}
                                                {seat.number}
                                            </motion.div>
                                        )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>

                    {/* Walkway */}
                    <div className="w-12 h-6 border-x border-amber-500/20 mx-2"></div>

                    {/* Second half container */}
                    <div
                        className="flex items-center justify-start gap-1"
                        style={{ minWidth: `${seatsPerSide * 28}px` }}
                    >
                        {secondHalf.map((seat) => (
                            <motion.button
                                key={seat.id}
                                onClick={(e) => handleSeatClick(seat, e)}
                                onKeyDown={(e) => handleKeyPress(e, seat)}
                                onMouseEnter={() => setHoveredSeat(seat.id)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                onFocus={() => setFocusedSeat(seat.id)}
                                onBlur={() => setFocusedSeat(null)}
                                className={`
                                    w-6 h-6 rounded-full flex items-center justify-center
                                    transition-all duration-300 relative group
                                    ${getSeatColor(seat)}
                                    ${
                                        hoveredSeat === seat.id ||
                                        focusedSeat === seat.id
                                            ? "scale-125 z-10"
                                            : ""
                                    }
                                `}
                                aria-label={`Row ${seat.row}, Seat ${seat.number} (${seat.zone} zone)`}
                            >
                                {renderSeatContent(seat)}

                                <AnimatePresence>
                                    {(hoveredSeat === seat.id ||
                                        focusedSeat === seat.id) &&
                                        seat.status !==
                                            SeatStatus.UNAVAILABLE && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none"
                                            >
                                                Row {seat.row}, Seat{" "}
                                                {seat.number}
                                            </motion.div>
                                        )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Mobile version - show all seats */}
                <div className="flex sm:hidden items-center justify-center gap-0.5">
                    {/* First half container */}
                    <div
                        className="flex items-center justify-end gap-0.5"
                        style={{ minWidth: `${seatsPerSide * 18}px` }}
                    >
                        {firstHalf.map((seat) => (
                            <motion.button
                                key={`mobile-${seat.id}`}
                                onClick={(e) => handleSeatClick(seat, e)}
                                onKeyDown={(e) => handleKeyPress(e, seat)}
                                onFocus={() => setFocusedSeat(seat.id)}
                                onBlur={() => setFocusedSeat(null)}
                                className={`
                                    w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                                    transition-all duration-200 relative active:scale-110
                                    ${getSeatColor(seat)}
                                    ${
                                        focusedSeat === seat.id
                                            ? "scale-110 z-10"
                                            : ""
                                    }
                                `}
                                aria-label={`Row ${seat.row}, Seat ${seat.number} (${seat.zone} zone)`}
                            >
                                {renderSeatContent(seat)}
                            </motion.button>
                        ))}
                    </div>

                    {/* Walkway */}
                    <div className="w-6 h-4 border-x border-amber-500/20 mx-1 flex-shrink-0"></div>

                    {/* Second half container */}
                    <div
                        className="flex items-center justify-start gap-0.5"
                        style={{ minWidth: `${seatsPerSide * 18}px` }}
                    >
                        {secondHalf.map((seat) => (
                            <motion.button
                                key={`mobile-second-${seat.id}`}
                                onClick={(e) => handleSeatClick(seat, e)}
                                onKeyDown={(e) => handleKeyPress(e, seat)}
                                onFocus={() => setFocusedSeat(seat.id)}
                                onBlur={() => setFocusedSeat(seat.id)}
                                className={`
                                    w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                                    transition-all duration-200 relative active:scale-110
                                    ${getSeatColor(seat)}
                                    ${
                                        focusedSeat === seat.id
                                            ? "scale-110 z-10"
                                            : ""
                                    }
                                `}
                                aria-label={`Row ${seat.row}, Seat ${seat.number} (${seat.zone} zone)`}
                            >
                                {renderSeatContent(seat)}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoadingSeatMap) {
        return (
            <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl border border-gray-700/20 p-4 sm:p-8 flex items-center justify-center">
                <div className="text-white/60 text-sm sm:text-base">
                    Loading seat map...
                </div>
            </div>
        );
    }

    if (seatMapError) {
        return (
            <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl border border-red-500/20 p-4 sm:p-8 flex items-center justify-center">
                <div className="text-red-400 text-sm sm:text-base">
                    Failed to load seat map
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-gray-800/20 backdrop-blur-xl rounded-xl border border-gray-700/20 
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5
      relative before:absolute before:inset-0 
      before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
      before:rounded-xl before:opacity-0 hover:before:opacity-100 
      before:transition-opacity before:duration-500"
        >
            <div className="p-3 sm:p-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="relative">
                        <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                        <div
                            className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1.5 sm:p-2 relative
              backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300"
                        >
                            <Armchair className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                            Select Your Seats
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-white/60">
                            {useCredits
                                ? "Using credits for booking"
                                : "Regular booking"}
                        </p>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-3 sm:mb-4"></div>

                <div
                    className="relative overflow-x-auto pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent"
                    ref={mapRef}
                >
                    <div className="min-w-fit">
                        {/* Stage */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="ml-[32px] sm:ml-[40px] w-[calc(100%-32px)] sm:w-[calc(100%-40px)] h-8 sm:h-12 lg:h-16 bg-gradient-to-t from-amber-500/20 to-amber-500/5
                rounded-xl mb-4 sm:mb-6 lg:mb-8 flex items-center justify-center border border-amber-500/20
                relative overflow-hidden group"
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            ></div>
                            <span
                                className="text-white/90 text-xs sm:text-sm font-medium relative z-10 group-hover:text-amber-400 
                transition-colors duration-300"
                            >
                                Stage
                            </span>
                        </motion.div>

                        {/* Seat Grid */}
                        <div className="flex flex-col gap-1 sm:gap-3 lg:gap-4">
                            {/* Show message if no seats available */}
                            {seatLayout.vipRows.length === 0 &&
                                seatLayout.regularRows.length === 0 && (
                                    <div className="text-center py-4 sm:py-8">
                                        <div className="text-white/60 text-sm sm:text-base">
                                            No seats available for this show
                                        </div>
                                    </div>
                                )}

                            {/* VIP Zone - Only show if there are VIP seats */}
                            {seatLayout.vipRows.length > 0 && (
                                <>
                                    <div className="text-center ml-[32px] sm:ml-[40px] sticky left-[32px] sm:left-[40px]">
                                        <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 bg-amber-500/10 rounded-full">
                                            <div className="w-1 sm:w-1.5 lg:w-2 h-1 sm:h-1.5 lg:h-2 rounded-full bg-amber-500"></div>
                                            <span className="text-white/90 text-xs sm:text-sm font-medium">
                                                VIP Zone
                                            </span>
                                        </div>
                                    </div>

                                    {/* VIP Rows */}
                                    {seatLayout.vipRows.map((row) =>
                                        renderSeatRow(
                                            row,
                                            seatLayout.vipSeats[row]
                                        )
                                    )}
                                </>
                            )}

                            {/* Regular Zone - Only show if there are Regular seats */}
                            {seatLayout.regularRows.length > 0 && (
                                <>
                                    <div className="text-center mt-2 sm:mt-4 lg:mt-6 ml-[32px] sm:ml-[40px] sticky left-[32px] sm:left-[40px]">
                                        <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 bg-blue-500/10 rounded-full">
                                            <div className="w-1 sm:w-1.5 lg:w-2 h-1 sm:h-1.5 lg:h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-white/90 text-xs sm:text-sm font-medium">
                                                Regular Zone
                                            </span>
                                        </div>
                                    </div>

                                    {/* Regular Rows */}
                                    {seatLayout.regularRows.map((row) =>
                                        renderSeatRow(
                                            row,
                                            seatLayout.regularSeats[row]
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Type Modal */}
            <AnimatePresence>
                {selectedSeatForModal && (
                    <TicketTypeModal
                        seat={selectedSeatForModal}
                        position={modalPosition}
                        direction={modalDirection}
                        onConfirm={handleTicketTypeSelect}
                        onClose={() => setSelectedSeatForModal(null)}
                        userType={userType}
                        onUserTypeChange={onUserTypeChange}
                        findPrice={findPrice}
                        useCredits={useCredits}
                        creditCosts={creditCosts}
                        hasSelectedSeats={selectedSeatIds.length > 0}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SeatMap;
