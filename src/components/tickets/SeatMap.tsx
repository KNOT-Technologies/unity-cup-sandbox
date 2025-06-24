import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Seat, UserType, TicketType } from '../../types/tickets';
import { SeatStatus } from '../../types/tickets';
import TicketTypeModal from './TicketTypeModal';

interface SeatMapProps {
  onSeatSelect: (seat: Seat, ticketType: TicketType) => void;
  selectedDate: Date;
  selectedShowTime?: string;
  userType: UserType;
}

const generateSeats = (date: Date, showTime?: string): Seat[] => {
  const seats: Seat[] = [];
  
  // VIP rows (A-C)
  ['A', 'B', 'C'].forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        zone: 'vip',
        status: Math.random() > 0.8 ? SeatStatus.UNAVAILABLE : SeatStatus.AVAILABLE
      });
    }
  });
  
  // Regular rows (D-F)
  ['D', 'E', 'F'].forEach((row) => {
    for (let i = 1; i <= 10; i++) {
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

const SeatMap = ({ onSeatSelect, selectedDate, selectedShowTime, userType }: SeatMapProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [focusedSeat, setFocusedSeat] = useState<string | null>(null);
  const [selectedSeatForModal, setSelectedSeatForModal] = useState<Seat | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeats(generateSeats(selectedDate, selectedShowTime));
  }, [selectedDate, selectedShowTime]);

  const handleSeatClick = (seat: Seat, event: React.MouseEvent) => {
    if (seat.status === SeatStatus.UNAVAILABLE) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setModalPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setSelectedSeatForModal(seat);
  };

  const handleTicketTypeSelect = (ticketType: TicketType) => {
    if (selectedSeatForModal) {
      const updatedSeats = seats.map((s) => {
        if (s.id === selectedSeatForModal.id) {
          return { ...s, status: SeatStatus.SELECTED };
        }
        return s;
      });
      setSeats(updatedSeats);
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
        available: 'bg-yellow-600 hover:bg-yellow-500 ring-2 ring-yellow-500/30 hover:ring-yellow-400/50',
        selected: 'bg-yellow-400 hover:bg-yellow-500 ring-2 ring-yellow-300 shadow-lg shadow-yellow-400/20',
        unavailable: 'bg-yellow-900/50 cursor-not-allowed ring-1 ring-yellow-800/30'
      },
      regular: {
        available: 'bg-blue-600 hover:bg-blue-500 ring-2 ring-blue-500/30 hover:ring-blue-400/50',
        selected: 'bg-blue-400 hover:bg-blue-500 ring-2 ring-blue-300 shadow-lg shadow-blue-400/20',
        unavailable: 'bg-blue-900/50 cursor-not-allowed ring-1 ring-blue-800/30'
      }
    };

    return baseColors[seat.zone][seat.status];
  };

  return (
    <div ref={mapRef} className="w-full max-w-4xl mx-auto">
      {/* Legend */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3">
          <div className="w-4 h-4 bg-yellow-600 ring-2 ring-yellow-500/30 rounded-full"></div>
          <span className="text-gray-300 text-sm">VIP Zone</span>
        </div>
        <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3">
          <div className="w-4 h-4 bg-blue-600 ring-2 ring-blue-500/30 rounded-full"></div>
          <span className="text-gray-300 text-sm">Regular Zone</span>
        </div>
        <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3">
          <div className="w-4 h-4 bg-gray-800 ring-1 ring-gray-700 rounded-full"></div>
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
        <div className="grid grid-cols-10 gap-2 md:gap-4 mb-8">
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
              className={`
                relative w-8 h-8 md:w-10 md:h-10 rounded-full 
                ${getSeatColor(seat)}
                transition-all duration-300 transform hover:scale-110
                flex items-center justify-center
                text-xs md:text-sm font-medium
                ${seat.status === SeatStatus.SELECTED ? 'text-gray-900' : 'text-white'}
                focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:ring-offset-2 
                focus:ring-offset-gray-900
              `}
              disabled={seat.status === SeatStatus.UNAVAILABLE}
              aria-label={`Row ${seat.row} Seat ${seat.number} - ${seat.status} - VIP Zone`}
            >
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
                     seat.status === SeatStatus.SELECTED ? 'Click to deselect' : 
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
        <div className="grid grid-cols-10 gap-2 md:gap-4">
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
              className={`
                relative w-8 h-8 md:w-10 md:h-10 rounded-full 
                ${getSeatColor(seat)}
                transition-all duration-300 transform hover:scale-110
                flex items-center justify-center
                text-xs md:text-sm font-medium
                ${seat.status === SeatStatus.SELECTED ? 'text-gray-900' : 'text-white'}
                focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2 
                focus:ring-offset-gray-900
              `}
              disabled={seat.status === SeatStatus.UNAVAILABLE}
              aria-label={`Row ${seat.row} Seat ${seat.number} - ${seat.status} - Regular Zone`}
            >
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
                     seat.status === SeatStatus.SELECTED ? 'Click to deselect' : 
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
            userType={userType}
            onClose={() => setSelectedSeatForModal(null)}
            onConfirm={handleTicketTypeSelect}
            position={modalPosition}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatMap; 