import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '../common/Portal';

interface DatePickerProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const DatePicker = ({ onDateSelect, selectedDate }: DatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

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

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCalendarOpen]);

  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      setDropdownPosition({
        top: rect.bottom + scrollY,
        left: rect.left,
        width: rect.width
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
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isPastDate(date)) {
      onDateSelect(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Date Display Button */}
      <button
        ref={triggerRef}
        onClick={handleOpenCalendar}
        className="w-full bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 
          border border-gray-700/50 text-left transition-all duration-300
          hover:border-yellow-400/30 hover:bg-yellow-400/5 group
          focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Selected Date</div>
            <div className="text-lg font-medium text-white group-hover:text-yellow-400 
              transition-colors duration-300"
            >
              {formatDate(selectedDate)}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 
              ${isCalendarOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

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
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 50
              }}
              className="overflow-visible"
            >
              <div className="bg-gray-800/95 backdrop-blur-md rounded-xl 
                border border-gray-700/50 shadow-xl shadow-black/20 p-4
                min-w-[320px] md:min-w-[360px]"
              >
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 
                      hover:bg-yellow-400/10 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-white font-medium">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 
                      hover:bg-yellow-400/10 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <div key={index} className="aspect-square">
                      {date ? (
                        <button
                          onClick={() => handleDateClick(date)}
                          disabled={isPastDate(date)}
                          className={`
                            w-full h-full flex items-center justify-center rounded-lg text-sm
                            transition-all duration-300 relative group
                            ${isPastDate(date)
                              ? 'text-gray-600 cursor-not-allowed bg-gray-800/30'
                              : isSelected(date)
                              ? 'bg-yellow-400 text-gray-900 font-medium'
                              : isToday(date)
                              ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900'
                              : 'text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400'
                            }
                          `}
                        >
                          <span className="relative z-10">{date.getDate()}</span>
                          {!isPastDate(date) && !isSelected(date) && (
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                              transition-opacity duration-300 bg-yellow-400/10"></div>
                          )}
                        </button>
                      ) : (
                        <div className="w-full h-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker; 