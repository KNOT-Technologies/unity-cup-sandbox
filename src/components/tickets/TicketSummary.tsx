import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus } from 'lucide-react';
import type { SelectedSeat, UserType } from '../../types/tickets';

interface TicketSummaryProps {
  selectedSeats: SelectedSeat[];
  userType: UserType;
  onRemoveSeat: (seatId: string) => void;
  className?: string;
  onProceedToCheckout: () => void;
  translationPreference?: {
    needed: boolean;
    language?: string;
  };
}

const TicketSummary: React.FC<TicketSummaryProps> = ({
  selectedSeats,
  userType,
  onRemoveSeat,
  className,
  onProceedToCheckout,
  translationPreference
}) => {
  const currency = userType === 'tourist' ? '$' : 'EGP';
  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const translationFee = translationPreference?.needed ? (userType === 'tourist' ? 10 : 150) : 0;
  const totalWithAddons = total + (translationFee * selectedSeats.length);

  return (
    <div className={`bg-gray-800/20 backdrop-blur-xl rounded-xl border border-gray-700/20 
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5
      relative before:absolute before:inset-0 
      before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
      before:rounded-xl before:opacity-0 hover:before:opacity-100 
      before:transition-opacity before:duration-500 before:pointer-events-none
      flex flex-col ${className}`}>
      
      <div className="p-5 flex flex-col h-full relative z-10">
        <div className="flex-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50 pointer-events-none"></div>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                <Ticket className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Selected Tickets
              </h3>
              <p className="text-sm font-medium text-white/60">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'} selected
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          <AnimatePresence initial={false}>
            {selectedSeats.map((seat) => (
              <motion.div
                key={seat.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3
                  hover:border-amber-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${seat.zone === 'vip' 
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-400/20 text-blue-400'
                        }`}
                      >
                        {seat.zone.toUpperCase()}
                      </span>
                      <span className="text-white/90">
                        Row {seat.row}, Seat {seat.number}
                      </span>
                    </div>
                    <div className="text-sm text-white/60 mt-0.5">
                      {seat.ticketType === 'adult' ? 'Adult' : 'Child'} Ticket
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-medium">
                      {currency} {seat.price}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveSeat(seat.id);
                      }}
                      className="text-white/40 hover:text-red-400 transition-colors duration-300 relative z-20"
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
            <div className="text-center py-4">
              <div className="text-white/40 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm">No tickets selected</p>
              <p className="text-xs text-white/60 mt-0.5 font-medium">
                Click on available seats to add tickets
              </p>
            </div>
          )}

          {translationPreference?.needed && selectedSeats.length > 0 && (
            <>
              <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent my-4"></div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50 pointer-events-none"></div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                      backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                      <Plus className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                    Add-ons
                  </h3>
                </div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3
                    hover:border-amber-500/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/90">Translation Headphones</div>
                      <div className="text-sm text-white/60 mt-0.5">
                        {translationPreference.language} (x{selectedSeats.length})
                      </div>
                    </div>
                    <span className="text-amber-400 font-medium">
                      {currency} {translationFee * selectedSeats.length}
                    </span>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>

        <div className="flex-none">
          {selectedSeats.length > 0 && (
            <>
              <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-white/60">
                  <span>Tickets Subtotal</span>
                  <span>{currency} {total}</span>
                </div>
                {translationPreference?.needed && (
                  <div className="flex justify-between text-white/60">
                    <span>Translation Service</span>
                    <span>{currency} {translationFee * selectedSeats.length}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-medium pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">{currency} {totalWithAddons}</span>
                </div>
              </div>
            </>
          )}

          <button
            onClick={onProceedToCheckout}
            disabled={selectedSeats.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300
              ${selectedSeats.length > 0
                ? 'bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 hover:shadow-lg hover:shadow-amber-500/20'
                : 'bg-gray-800/50 text-white/30 cursor-not-allowed'
              }
            `}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketSummary; 