import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import Portal from "../common/Portal";

interface DatePickerProps {
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
    availableDates?: Date[];
}

const DatePicker = ({
    onDateSelect,
    selectedDate,
    availableDates,
}: DatePickerProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsCalendarOpen(false);
            }
        };

        const handleScroll = () => {
            if (isCalendarOpen && triggerRef.current) {
                updateDropdownPosition();
            }
        };

        const handleResize = () => {
            if (isCalendarOpen && triggerRef.current) {
                updateDropdownPosition();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, [isCalendarOpen]);

    const updateDropdownPosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;

            setDropdownPosition({
                top: rect.bottom + scrollY,
                left: rect.left,
                width: rect.width,
            });
        }
    };

    const handleOpenCalendar = () => {
        updateDropdownPosition();
        setIsCalendarOpen(true);
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days: Array<Date | null> = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isAvailableDate = (date: Date) => {
        if (!availableDates || availableDates.length === 0) return true; // If no restriction, all dates are available
        return availableDates.some(
            (availableDate) =>
                availableDate.toDateString() === date.toDateString()
        );
    };

    const handlePrevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
        );
    };

    const handleDateClick = (date: Date) => {
        if (!isPastDate(date) && isAvailableDate(date)) {
            onDateSelect(date);
            setIsCalendarOpen(false);
        }
    };

    return (
        <div className="relative">
            {/* Date Display Button */}
            <div
                className="bg-gray-800/20 backdrop-blur-xl rounded-2xl p-3 sm:p-6 
        border border-gray-700/20 
        hover:border-amber-500/20 transition-all duration-500 
        hover:shadow-2xl hover:shadow-amber-500/5
        relative before:absolute before:inset-0 
        before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
        before:rounded-2xl before:opacity-0 hover:before:opacity-100 
        before:transition-opacity before:duration-500"
            >
                <div className="relative">
                    <div className="flex items-center gap-3 mb-3 sm:mb-6">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                            <div
                                className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg sm:rounded-xl p-2 sm:p-2.5 relative
                backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300"
                            >
                                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-sm sm:text-lg font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                            Select Date
                        </h3>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-3 sm:mb-6"></div>

                    <button
                        ref={triggerRef}
                        onClick={handleOpenCalendar}
                        className="w-full bg-gray-800/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 
              border border-gray-700/30 text-left transition-all duration-300
              hover:border-amber-500/20 hover:bg-gray-700/30 
              hover:shadow-lg hover:shadow-amber-500/5 group
              focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                        <div className="flex items-center justify-between">
                            <div
                                className="text-base sm:text-lg font-medium text-white group-hover:text-white/90 
                transition-colors duration-300"
                            >
                                {formatDate(selectedDate)}
                            </div>
                            <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-300 
                  ${isCalendarOpen ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </button>
                </div>
            </div>

            {/* Calendar Dropdown Portal */}
            <AnimatePresence>
                {isCalendarOpen && (
                    <Portal>
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" />
                        <motion.div
                            ref={calendarRef}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: "absolute",
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: Math.max(dropdownPosition.width, 320),
                                zIndex: 50,
                            }}
                            className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 
                border border-gray-700/30 shadow-xl shadow-black/20
                before:absolute before:inset-0 before:bg-gradient-to-b 
                before:from-amber-500/5 before:to-transparent before:rounded-2xl"
                        >
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 rounded-xl hover:bg-gray-800/50 
                    transition-colors duration-300 group"
                                >
                                    <svg
                                        className="w-5 h-5 text-amber-400 transform rotate-90 
                      group-hover:text-amber-300 transition-colors duration-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                                <h3 className="text-lg font-medium text-white">
                                    {new Intl.DateTimeFormat("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    }).format(currentMonth)}
                                </h3>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 rounded-xl hover:bg-gray-800/50 
                    transition-colors duration-300 group"
                                >
                                    <svg
                                        className="w-5 h-5 text-amber-400 transform -rotate-90 
                      group-hover:text-amber-300 transition-colors duration-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {[
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                ].map((day) => (
                                    <div
                                        key={day}
                                        className="text-center text-sm font-medium text-amber-400/70 py-2"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(currentMonth).map(
                                    (date, index) => {
                                        if (!date) {
                                            return (
                                                <div
                                                    key={`empty-${index}`}
                                                    className="aspect-square"
                                                />
                                            );
                                        }

                                        const isDisabled = isPastDate(date);
                                        const isActiveDate = isSelected(date);
                                        const isTodayDate = isToday(date);
                                        const hasShows = isAvailableDate(date);

                                        return (
                                            <button
                                                key={date.toISOString()}
                                                onClick={() =>
                                                    handleDateClick(date)
                                                }
                                                disabled={
                                                    isDisabled || !hasShows
                                                }
                                                className={`
                        relative aspect-square rounded-xl text-sm font-medium
                        flex items-center justify-center
                        transition-all duration-300
                        ${
                            isDisabled
                                ? "text-gray-600 cursor-not-allowed"
                                : !hasShows
                                ? "text-gray-500 cursor-not-allowed opacity-50"
                                : isActiveDate
                                ? "bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 shadow-lg shadow-amber-500/10"
                                : isTodayDate && hasShows
                                ? "bg-gray-800/30 text-white border border-amber-500/30"
                                : hasShows
                                ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                                : "text-gray-500"
                        }
                        ${
                            !isDisabled && hasShows && !isActiveDate
                                ? "hover:shadow-md hover:shadow-amber-500/5"
                                : ""
                        }
                      `}
                                                title={
                                                    !hasShows && !isDisabled
                                                        ? "No shows available on this date"
                                                        : ""
                                                }
                                            >
                                                {date.getDate()}
                                                {isActiveDate && (
                                                    <div className="absolute inset-0 rounded-xl bg-amber-500/10 animate-pulse" />
                                                )}
                                                {hasShows &&
                                                    !isDisabled &&
                                                    !isActiveDate && (
                                                        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-60" />
                                                    )}
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </motion.div>
                    </Portal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
