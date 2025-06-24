import { motion, AnimatePresence } from 'framer-motion';
import type { SelectedSeat, UserType } from '../../types/tickets';

interface TicketSummaryProps {
  selectedSeats: SelectedSeat[];
  userType: UserType;
  onRemoveSeat: (seatId: string) => void;
  className?: string;
}

const TicketSummary = ({ selectedSeats, userType, onRemoveSeat, className = '' }: TicketSummaryProps) => {
  const currency = userType === 'tourist' ? '$' : 'EGP';
  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/30 
      flex flex-col ${className}`}>
      <div className="p-6 border-b border-gray-700/50">
        <h2 className="text-xl font-serif font-semibold text-white mb-2">Selected Tickets</h2>
        <p className="text-sm text-gray-400">
          {selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'} selected
        </p>
      </div>

      <div className="flex-grow overflow-auto p-6 space-y-4">
        <AnimatePresence>
          {selectedSeats.map((seat) => (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-gray-800/30 rounded-xl border border-gray-700 p-4
                hover:border-gray-600 transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      Row {seat.row}, Seat {seat.number}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${seat.zone === 'vip' 
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : 'bg-blue-400/20 text-blue-400'
                      }`}
                    >
                      {seat.zone.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1 capitalize">
                    {seat.ticketType}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-yellow-400 font-medium">
                    {currency} {seat.price}
                  </span>
                  <button
                    onClick={() => onRemoveSeat(seat.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors duration-300"
                    aria-label={`Remove ticket for Row ${seat.row}, Seat ${seat.number}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {selectedSeats.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400">No tickets selected</p>
            <p className="text-sm text-gray-500 mt-1">
              Click on available seats to add tickets
            </p>
          </div>
        )}
      </div>

      {selectedSeats.length > 0 && (
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <span className="text-white font-medium">Total</span>
            <span className="text-xl font-bold text-yellow-400">
              {currency} {total}
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-yellow-400 text-gray-900 py-3 px-6 rounded-lg 
              hover:bg-yellow-500 transition-all duration-300 font-medium
              hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]
              focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
            onClick={() => window.location.href = '/checkout'}
          >
            Proceed to Checkout
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default TicketSummary; 