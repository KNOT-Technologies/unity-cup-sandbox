import { motion, AnimatePresence } from 'framer-motion';
import Portal from '../common/Portal';
import { PRICING } from '../../types/tickets';
import type { Seat, UserType, TicketType } from '../../types/tickets';
import { Ticket } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            bounce: 0.1, 
            duration: 0.4,
            opacity: { duration: 0.2 }
          }}
          style={{
            position: 'absolute',
            top: position.y,
            left: position.x,
            transform: 'translate(-50%, -120%)'
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800/20 backdrop-blur-xl rounded-xl border border-gray-700/20 
            motion-safe:animate-fade-in motion-safe:animate-duration-500
            hover:border-amber-500/20 transition-[border,shadow] duration-300 delay-200
            hover:shadow-2xl hover:shadow-amber-500/5 p-6 min-w-[280px]
            relative before:absolute before:inset-0 
            before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
            before:rounded-xl before:opacity-0 hover:before:opacity-100 
            before:transition-opacity before:duration-300 before:delay-200"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                  backdrop-blur-xl border border-amber-500/20 transition-[border,background] duration-300 delay-200">
                  <Ticket className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                  {seat.zone === 'vip' ? 'VIP Zone' : 'Regular Zone'} - Row {seat.row}, Seat {seat.number}
                </h3>
                <p className="text-sm font-medium text-white/60">
                  Select ticket type
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>

            <div className="space-y-2">
              {(['senior', 'student', 'child'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onConfirm(type)}
                  className="w-full p-3 rounded-lg border border-gray-700/50 bg-gray-800/30
                    hover:bg-amber-500/10 hover:border-amber-500/30 
                    transition-[background,border] duration-300 delay-200 group relative
                    before:absolute before:inset-0 
                    before:bg-gradient-to-r before:from-amber-500/0 before:via-amber-500/5 before:to-amber-500/0 
                    before:rounded-lg before:opacity-0 group-hover:before:opacity-100 
                    before:transition-opacity before:duration-300 before:delay-200"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-white/90 capitalize group-hover:text-white 
                      transition-colors duration-300 delay-200">
                      {type}
                    </span>
                    <span className="text-amber-400 font-medium group-hover:text-amber-300
                      transition-colors duration-300 delay-200">
                      {currency} {pricing[type]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="absolute -inset-6 z-0"></div>

          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 translate-y-full
            border-[10px] border-transparent border-t-gray-800/20 z-10"></div>
        </motion.div>
      </div>
    </Portal>
  );
};

export default TicketTypeModal; 