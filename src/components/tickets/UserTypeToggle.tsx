import { motion } from 'framer-motion';
import type { UserType } from '../../types/tickets';

interface UserTypeToggleProps {
  userType: UserType;
  onUserTypeChange: (type: UserType) => void;
}

const UserTypeToggle = ({ userType, onUserTypeChange }: UserTypeToggleProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-sm font-medium text-gray-400">Select User Type</label>
      <div className="bg-gray-800/50 backdrop-blur-sm p-1 rounded-xl border border-gray-700/50
        flex shadow-inner shadow-black/10">
        {(['tourist', 'local'] as const).map((type) => (
          <motion.button
            key={type}
            onClick={() => onUserTypeChange(type)}
            className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-colors
              duration-300 ${userType === type ? '' : 'hover:text-yellow-400'}`}
            animate={{
              color: userType === type ? '#111827' : '#9CA3AF'
            }}
          >
            {userType === type && (
              <motion.div
                layoutId="userTypeBackground"
                className="absolute inset-0 bg-yellow-400 rounded-lg"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 capitalize">
              {type}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default UserTypeToggle; 