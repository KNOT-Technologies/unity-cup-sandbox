import { motion, AnimatePresence } from 'framer-motion';
import Portal from '../common/Portal';
import { PRICING } from '../../types/tickets';
import type { Seat, UserType, TicketType } from '../../types/tickets';

interface TicketTypeModalProps {
  seat: Seat;
  userType: UserType;
  onClose: () => void;
  onConfirm: (ticketType: TicketType) => void;
  position: { x: number; y: number };
}

const TicketTypeModal = ({ seat, userType, onClose, onConfirm, position }: TicketTypeModalProps) => {
  const pricing = PRICING[userType][seat.zone];
  const currency = userType === 'tourist' ? '$' : 'EGP';

  return (
    <Portal>
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          style={{
            position: 'absolute',
            top: position.y,
            left: position.x,
            transform: 'translate(-50%, -110%)'
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800/95 backdrop-blur-md rounded-xl border border-gray-700/50 
            shadow-xl shadow-black/20 p-4 min-w-[240px]"
        >
          <div className="text-center mb-4">
            <h3 className="text-white font-medium">
              {seat.zone.toUpperCase()} Zone - Row {seat.row}, Seat {seat.number}
            </h3>
            <p className="text-sm text-gray-400 mt-1">Select ticket type</p>
          </div>

          <div className="space-y-2">
            {(['adult', 'child'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onConfirm(type)}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/50
                  hover:bg-yellow-400/10 hover:border-yellow-400/30 
                  transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white capitalize group-hover:text-yellow-400 
                    transition-colors duration-300">
                    {type}
                  </span>
                  <span className="text-yellow-400 font-medium">
                    {currency} {pricing[type]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full
            border-8 border-transparent border-t-gray-800/95"></div>
        </motion.div>
      </div>
    </Portal>
  );
};

export default TicketTypeModal; 