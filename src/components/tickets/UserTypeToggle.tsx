import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { UserType } from '../../types/tickets';

interface UserTypeToggleProps {
  userType: UserType;
  onUserTypeChange: (type: UserType) => void;
}

const UserTypeToggle = ({ userType, onUserTypeChange }: UserTypeToggleProps) => {
  return (
    <div className="bg-gray-800/20 backdrop-blur-xl rounded-xl p-5 
      border border-gray-700/20 
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5
      relative before:absolute before:inset-0 
      before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
      before:rounded-xl before:opacity-0 hover:before:opacity-100 
      before:transition-opacity before:duration-500">
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
              backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            Select User Type
          </h3>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>

        <div className="bg-gray-800/30 backdrop-blur-sm p-1 rounded-lg border border-gray-700/30
          flex shadow-lg shadow-black/5 hover:shadow-amber-500/5 transition-all duration-300">
          {(['tourist', 'local'] as const).map((type) => (
            <motion.button
              key={type}
              onClick={() => onUserTypeChange(type)}
              className={`relative flex-1 px-5 py-2.5 rounded-lg text-sm font-medium transition-all
                duration-300 ${userType === type ? '' : 'hover:text-amber-400'}`}
              animate={{
                color: userType === type ? '#111827' : '#ffffff99'
              }}
            >
              {userType === type && (
                <motion.div
                  layoutId="userTypeBackground"
                  className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-400 rounded-lg
                    shadow-lg shadow-amber-500/20"
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
    </div>
  );
};

export default UserTypeToggle; 