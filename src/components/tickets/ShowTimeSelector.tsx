import { motion } from 'framer-motion';
import type { ShowTime } from '../../types/tickets';

interface ShowTimeSelectorProps {
  showTimes: ShowTime[];
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
}

const ShowTimeSelector = ({ showTimes, selectedTime, onTimeSelect }: ShowTimeSelectorProps) => {
  // Mock show times if none provided
  const times = showTimes.length > 0 ? showTimes : [
    { id: '1', time: '19:00', language: 'English' },
    { id: '2', time: '20:00', language: 'Arabic' },
    { id: '3', time: '21:00', language: 'English' }
  ];

  return (
    <div className="w-full">
      <h3 className="text-gray-400 text-sm font-medium mb-4">Select Show Time</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {times.map((show) => (
          <motion.button
            key={show.id}
            onClick={() => onTimeSelect(show.time)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300
              ${selectedTime === show.time
                ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-gray-600'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg font-medium">{show.time}</span>
              <span className="text-sm opacity-80">{show.language}</span>
            </div>

            {selectedTime === show.time && (
              <motion.div
                layoutId="timeSelection"
                className="absolute inset-0 border-2 border-yellow-400/30 rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ShowTimeSelector; 