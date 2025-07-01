import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { ShowTime } from "../../types/tickets";

interface ShowTimeSelectorProps {
    showTimes: ShowTime[];
    selectedOccurrenceId?: string;
    onOccurrenceSelect: (occurrenceId: string) => void;
    className?: string;
}

// Helper to convert ISO language codes (e.g., "en", "ar") to human-readable names
// Extend this map as new languages are introduced by the API.
const languageNames: Record<string, string> = {
    en: "English",
    ar: "Arabic",
    fr: "French",
    es: "Spanish",
    de: "German",
};

const getLanguageName = (code: string): string => {
    // Normalize to lowercase and strip region subtags (e.g., "en-US" -> "en") for look-up
    const normalized = code.toLowerCase().split("-")[0];
    return languageNames[normalized] ?? code;
};

const ShowTimeSelector = ({
    showTimes,
    selectedOccurrenceId,
    onOccurrenceSelect,
    className = "",
}: ShowTimeSelectorProps) => {
    // Mock show times if none provided
    const times = showTimes.length > 0 ? showTimes : [];

    return (
        <div
            className={`bg-gray-800/20 backdrop-blur-xl rounded-xl p-3 sm:p-5 
      border border-gray-700/20 
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5
      relative before:absolute before:inset-0 
      before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
      before:rounded-xl before:opacity-0 hover:before:opacity-100 
      before:transition-opacity before:duration-500 ${className}`}
        >
            <div className="relative">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                        <div
                            className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
              backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300"
                        >
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                        Select Show Time
                    </h3>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-3 sm:mb-4"></div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {times.map((show) => (
                        <motion.button
                            key={show.id}
                            onClick={() => onOccurrenceSelect(show.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                relative p-2 sm:p-3 rounded-lg border backdrop-blur-sm transition-all duration-300
                ${
                    selectedOccurrenceId === show.id
                        ? "bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 border-transparent shadow-lg shadow-amber-500/20"
                        : "bg-gray-800/30 text-white border-gray-700/30 hover:bg-gray-700/30 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5"
                }
              `}
                        >
                            <div className="flex flex-col items-center space-y-0.5 sm:space-y-1">
                                <span className="text-base sm:text-lg font-medium">
                                    {show.time}
                                </span>
                                <span
                                    className={`text-xs sm:text-sm font-medium ${
                                        selectedOccurrenceId === show.id
                                            ? "text-gray-800"
                                            : "text-white/60"
                                    }`}
                                >
                                    {getLanguageName(show.language)}
                                </span>
                            </div>

                            {selectedOccurrenceId === show.id && (
                                <motion.div
                                    layoutId="timeSelection"
                                    className="absolute inset-0 border-2 border-amber-400/30 rounded-lg"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        bounce: 0.2,
                                        duration: 0.6,
                                    }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShowTimeSelector;
