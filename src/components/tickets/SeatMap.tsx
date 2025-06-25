import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Seat, UserType, TicketType } from '../../types/tickets';
import { SeatStatus } from '../../types/tickets';
import TicketTypeModal from './TicketTypeModal';

interface SeatMapProps {
  onSeatSelect: (seat: Seat, ticketType: TicketType) => void;
  onSeatDeselect?: (seatId: string) => void;
  selectedDate: Date;
  selectedShowTime?: string;
  userType: UserType;
  selectedSeatIds?: string[];
}

const generateInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];
  
  // VIP rows (A-H)
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((row) => {
    // First half (1-10)
    for (let i = 1; i <= 10; i++) {
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        zone: 'vip',
        status: Math.random() > 0.8 ? SeatStatus.UNAVAILABLE : SeatStatus.AVAILABLE
      });
    }
    // Second half (11-20)
    for (let i = 11; i <= 20; i++) {
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        zone: 'vip',
        status: Math.random() > 0.8 ? SeatStatus.UNAVAILABLE : SeatStatus.AVAILABLE
      });
    }
  });
  
  // Regular rows (I-P)
  ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].forEach((row) => {
    // First half (1-10)
    for (let i = 1; i <= 10; i++) {
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        zone: 'regular',
        status: Math.random() > 0.8 ? SeatStatus.UNAVAILABLE : SeatStatus.AVAILABLE
      });
    }
    // Second half (11-20)
    for (let i = 11; i <= 20; i++) {
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        zone: 'regular',
        status: Math.random() > 0.8 ? SeatStatus.UNAVAILABLE : SeatStatus.AVAILABLE
      });
    }
  });
  
  return seats;
};

const SeatMap = ({ 
  onSeatSelect, 
  onSeatDeselect, 
  selectedDate, 
  selectedShowTime, 
  userType,
  selectedSeatIds = []
}: SeatMapProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [focusedSeat, setFocusedSeat] = useState<string | null>(null);
  const [selectedSeatForModal, setSelectedSeatForModal] = useState<Seat | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const initialSeatsRef = useRef<Seat[]>([]);

  // Generate initial seats only once
  useEffect(() => {
    if (initialSeatsRef.current.length === 0) {
      initialSeatsRef.current = generateInitialSeats();
      setSeats(initialSeatsRef.current);
    }
  }, []);

  // Update only selected status when selections change
  useEffect(() => {
    if (initialSeatsRef.current.length > 0) {
      const updatedSeats = initialSeatsRef.current.map(seat => ({
        ...seat,
        status: selectedSeatIds.includes(seat.id) ? SeatStatus.SELECTED : 
               seat.status === SeatStatus.SELECTED ? SeatStatus.AVAILABLE : 
               seat.status
      }));
      setSeats(updatedSeats);
    }
  }, [selectedSeatIds]);

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
      y: rect.top
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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (seat.status !== SeatStatus.UNAVAILABLE) {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        setModalPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
        setSelectedSeatForModal(seat);
      }
    }
  };

  const getSeatColor = (seat: Seat) => {
    const baseColors = {
      vip: {
        available: 'bg-yellow-700/80 hover:bg-yellow-600 ring-2 ring-yellow-600/30 hover:ring-yellow-500/50',
        selected: 'bg-yellow-400 hover:bg-yellow-500 ring-2 ring-yellow-300/80 shadow-lg shadow-yellow-400/30',
        unavailable: 'bg-yellow-900/50 cursor-not-allowed ring-1 ring-yellow-800/30'
      },
      regular: {
        available: 'bg-blue-700/80 hover:bg-blue-600 ring-2 ring-blue-600/30 hover:ring-blue-500/50',
        selected: 'bg-blue-400 hover:bg-blue-500 ring-2 ring-blue-300/80 shadow-lg shadow-blue-400/30',
        unavailable: 'bg-blue-900/50 cursor-not-allowed ring-1 ring-blue-800/30'
      }
    };

    return baseColors[seat.zone][seat.status];
  };

  const renderSeatContent = (seat: Seat) => {
    if (seat.status === SeatStatus.SELECTED) {
      return (
        <Check 
          className="w-3 h-3 md:w-4 md:h-4 text-white stroke-[3]"
        />
      );
    }
    return null;
  };

  return (
    <div ref={mapRef} className="w-full max-w-6xl mx-auto">
      {/* Legend */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3">
          <div className="w-3 h-3 bg-yellow-600 ring-2 ring-yellow-500/30 rounded-full"></div>
          <span className="text-gray-300 text-sm">VIP Zone</span>
        </div>
        <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3">
          <div className="w-3 h-3 bg-blue-600 ring-2 ring-blue-500/30 rounded-full"></div>
          <span className="text-gray-300 text-sm">Regular Zone</span>
        </div>
        <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3">
          <div className="w-3 h-3 bg-gray-800 ring-1 ring-gray-700 rounded-full"></div>
          <span className="text-gray-300 text-sm">Unavailable</span>
        </div>
      </div>

      <div className="relative">
        {/* Stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-16 bg-gray-800/80 rounded-2xl mb-12 flex items-center justify-center 
            border border-gray-700 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 
            opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="text-gray-300 text-lg font-medium relative z-10 group-hover:text-yellow-400 
            transition-colors duration-300">Stage</span>
        </motion.div>

        {/* VIP Zone Label */}
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm">
            VIP Zone
          </span>
        </div>

        {/* VIP Seats */}
        <div className="grid grid-cols-[repeat(10,minmax(0,1fr))_1fr_repeat(10,minmax(0,1fr))] gap-1 md:gap-2 mb-8">
          {seats.filter(seat => seat.zone === 'vip').map((seat) => (
            <motion.button
              key={seat.id}
              onClick={(e) => handleSeatClick(seat, e)}
              onMouseEnter={() => setHoveredSeat(seat.id)}
              onMouseLeave={() => setHoveredSeat(null)}
              onFocus={() => setFocusedSeat(seat.id)}
              onBlur={() => setFocusedSeat(null)}
              onKeyDown={(e) => handleKeyPress(e, seat)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`                relative w-4 h-4 md:w-5 md:h-5 rounded-full 
                ${getSeatColor(seat)}
                transition-all duration-300 transform hover:scale-110
                flex items-center justify-center
                text-[8px] md:text-[10px] font-medium
                focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:ring-offset-2 
                focus:ring-offset-gray-900
                ${seat.number === 11 ? 'col-start-12' : ''}
              `}
              disabled={seat.status === SeatStatus.UNAVAILABLE}
              aria-label={`Row ${seat.row} Seat ${seat.number} - ${seat.status} - VIP Zone`}
            >
              {renderSeatContent(seat)}
              {(hoveredSeat === seat.id || focusedSeat === seat.id) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: -4 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                    bg-gray-800 text-gray-300 text-xs py-1.5 px-3 rounded-lg whitespace-nowrap
                    border border-gray-700 backdrop-blur-sm z-10 shadow-lg shadow-black/20"
                >
                  <div className="font-medium">Row {seat.row} Seat {seat.number}</div>
                  <div className="text-yellow-400 text-[10px] font-medium mt-0.5">
                    {seat.status === SeatStatus.AVAILABLE ? 'Click to select' : 
                     seat.status === SeatStatus.SELECTED ? 'Selected' : 
                     'Unavailable'}
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2
                    border-4 border-transparent border-t-gray-800"></div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Regular Zone Label */}
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm">
            Regular Zone
          </span>
        </div>

        {/* Regular Seats */}
        <div className="grid grid-cols-[repeat(10,minmax(0,1fr))_1fr_repeat(10,minmax(0,1fr))] gap-1 md:gap-2">
          {seats.filter(seat => seat.zone === 'regular').map((seat) => (
            <motion.button
              key={seat.id}
              onClick={(e) => handleSeatClick(seat, e)}
              onMouseEnter={() => setHoveredSeat(seat.id)}
              onMouseLeave={() => setHoveredSeat(null)}
              onFocus={() => setFocusedSeat(seat.id)}
              onBlur={() => setFocusedSeat(null)}
              onKeyDown={(e) => handleKeyPress(e, seat)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`                relative w-4 h-4 md:w-5 md:h-5 rounded-full 
                ${getSeatColor(seat)}
                transition-all duration-300 transform hover:scale-110
                flex items-center justify-center
                text-[8px] md:text-[10px] font-medium
                focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2 
                focus:ring-offset-gray-900
                ${seat.number === 11 ? 'col-start-12' : ''}
              `}
              disabled={seat.status === SeatStatus.UNAVAILABLE}
              aria-label={`Row ${seat.row} Seat ${seat.number} - ${seat.status} - Regular Zone`}
            >
              {renderSeatContent(seat)}
              {(hoveredSeat === seat.id || focusedSeat === seat.id) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: -4 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                    bg-gray-800 text-gray-300 text-xs py-1.5 px-3 rounded-lg whitespace-nowrap
                    border border-gray-700 backdrop-blur-sm z-10 shadow-lg shadow-black/20"
                >
                  <div className="font-medium">Row {seat.row} Seat {seat.number}</div>
                  <div className="text-blue-400 text-[10px] font-medium mt-0.5">
                    {seat.status === SeatStatus.AVAILABLE ? 'Click to select' : 
                     seat.status === SeatStatus.SELECTED ? 'Selected' : 
                     'Unavailable'}
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2
                    border-4 border-transparent border-t-gray-800"></div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Ticket Type Modal */}
      <AnimatePresence>
        {selectedSeatForModal && (
          <TicketTypeModal
            seat={selectedSeatForModal}
            onConfirm={handleTicketTypeSelect}
            onClose={() => setSelectedSeatForModal(null)}
            position={modalPosition}
            userType={userType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatMap; 

