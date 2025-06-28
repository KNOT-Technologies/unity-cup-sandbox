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

        return {
            vipRows: Object.keys(layout.vip).sort(),
            regularRows: Object.keys(layout.regular).sort(),
            vipSeats: layout.vip,
            regularSeats: layout.regular,
        };
    }, [seats]);

    const handleSeatClick = (seat: Seat, event: React.MouseEvent) => {
        if (seat.status === SeatStatus.UNAVAILABLE) return;

        // If seat is already selected, deselect it
        if (seat.status === SeatStatus.SELECTED) {
            if (onSeatDeselect) {
                onSeatDeselect(seat.id);
            }
            return;
        }

        // If seat is available, show ticket type modal
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setModalPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
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
                setModalPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
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
                <Check className="w-3 h-3 md:w-4 md:h-4 text-white stroke-[3]" />
            );
        }
        return null;
    };

    const renderSeatRow = (
        row: string,
        rowSeats: Seat[],
        maxSeatsPerRow: number
    ) => {
        // Group seats by first/second half for walkway
        const firstHalf = rowSeats.filter(
            (seat) => seat.number <= maxSeatsPerRow / 2
        );
        const secondHalf = rowSeats.filter(
            (seat) => seat.number > maxSeatsPerRow / 2
        );

        return (
            <div
                key={row}
                className="grid grid-cols-[48px_1fr] gap-2 items-center"
            >
                <div className="flex justify-center items-center w-8 h-8 text-white/60 text-sm font-medium bg-gray-800/30 rounded-lg sticky left-0">
                    {row}
                </div>
                <div className="grid grid-cols-[repeat(10,28px)_48px_repeat(10,28px)] sm:grid-cols-[repeat(10,32px)_48px_repeat(10,32px)] justify-center">
                    {/* First half of seats */}
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
                                w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mx-auto
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
                                    seat.status !== SeatStatus.UNAVAILABLE && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none"
                                        >
                                            Row {seat.row}, Seat {seat.number}
                                        </motion.div>
                                    )}
                            </AnimatePresence>
                        </motion.button>
                    ))}

                    {/* Walkway */}
                    <div className="w-12 h-5 sm:h-6 border-x border-amber-500/20 col-span-1 mx-auto"></div>

                    {/* Second half of seats */}
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
                                w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mx-auto
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
                                    seat.status !== SeatStatus.UNAVAILABLE && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none"
                                        >
                                            Row {seat.row}, Seat {seat.number}
                                        </motion.div>
                                    )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoadingSeatMap) {
        return (
            <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl border border-gray-700/20 p-8 flex items-center justify-center">
                <div className="text-white/60">Loading seat map...</div>
            </div>
        );
    }

    if (seatMapError) {
        return (
            <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl border border-red-500/20 p-8 flex items-center justify-center">
                <div className="text-red-400">Failed to load seat map</div>
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
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                        <div
                            className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
              backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300"
                        >
                            <Armchair className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                            Select Your Seats
                        </h3>
                        <p className="text-sm font-medium text-white/60">
                            {useCredits
                                ? "Using credits for booking"
                                : "Regular booking"}
                        </p>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>

                <div
                    className="relative overflow-x-auto pb-4 sm:pb-0"
                    ref={mapRef}
                >
                    <div className="min-w-[800px] sm:min-w-0">
                        {/* Stage */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="ml-[48px] w-[calc(100%-48px)] h-12 sm:h-16 bg-gradient-to-t from-amber-500/20 to-amber-500/5
                rounded-xl mb-6 sm:mb-8 flex items-center justify-center border border-amber-500/20
                relative overflow-hidden group"
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            ></div>
                            <span
                                className="text-white/90 text-sm font-medium relative z-10 group-hover:text-amber-400 
                transition-colors duration-300"
                            >
                                Stage
                            </span>
                        </motion.div>

                        {/* Seat Grid */}
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Show message if no seats available */}
                            {seatLayout.vipRows.length === 0 &&
                                seatLayout.regularRows.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-white/60">
                                            No seats available for this show
                                        </div>
                                    </div>
                                )}

                            {/* VIP Zone - Only show if there are VIP seats */}
                            {seatLayout.vipRows.length > 0 && (
                                <>
                                    <div className="text-center ml-[48px] sticky left-[48px]">
                                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-amber-500/10 rounded-full">
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-amber-500"></div>
                                            <span className="text-white/90 text-xs sm:text-sm font-medium">
                                                VIP Zone
                                            </span>
                                        </div>
                                    </div>

                                    {/* VIP Rows */}
                                    {seatLayout.vipRows.map((row) =>
                                        renderSeatRow(
                                            row,
                                            seatLayout.vipSeats[row],
                                            10
                                        )
                                    )}
                                </>
                            )}

                            {/* Regular Zone - Only show if there are Regular seats */}
                            {seatLayout.regularRows.length > 0 && (
                                <>
                                    <div className="text-center mt-4 sm:mt-6 ml-[48px] sticky left-[48px]">
                                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-500/10 rounded-full">
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-white/90 text-xs sm:text-sm font-medium">
                                                Regular Zone
                                            </span>
                                        </div>
                                    </div>

                                    {/* Regular Rows */}
                                    {seatLayout.regularRows.map((row) =>
                                        renderSeatRow(
                                            row,
                                            seatLayout.regularSeats[row],
                                            10
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
                        onConfirm={handleTicketTypeSelect}
                        onClose={() => setSelectedSeatForModal(null)}
                        userType={userType}
                        onUserTypeChange={onUserTypeChange}
                        findPrice={findPrice}
                        useCredits={useCredits}
                        creditCosts={creditCosts}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SeatMap;
