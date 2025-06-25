import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
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
      <div className="bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 
        border border-gray-700/20 
        hover:border-amber-500/20 transition-all duration-500 
        hover:shadow-2xl hover:shadow-amber-500/5
        relative before:absolute before:inset-0 
        before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
        before:rounded-2xl before:opacity-0 hover:before:opacity-100 
        before:transition-opacity before:duration-500">
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl p-2.5 relative
                backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              Select Date
            </h3>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-6"></div>

          <button
            ref={triggerRef}
            onClick={handleOpenCalendar}
            className="w-full bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 
              border border-gray-700/30 text-left transition-all duration-300
              hover:border-amber-500/20 hover:bg-gray-700/30 
              hover:shadow-lg hover:shadow-amber-500/5 group
              focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium text-white group-hover:text-white/90 
                transition-colors duration-300"
              >
                {formatDate(selectedDate)}
              </div>
              <svg
                className={`w-5 h-5 text-amber-400 transition-transform duration-300 
                  ${isCalendarOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                position: 'absolute',
                top: dropdownPosition.top + 16,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 50
              }}
              className="overflow-visible"
            >
              <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl 
                border border-gray-700/30 shadow-xl shadow-black/20 p-6
                min-w-[320px] md:min-w-[360px]"
              >
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2.5 rounded-xl text-white/60 hover:text-amber-400 
                      hover:bg-amber-500/10 transition-all duration-300"
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
                    className="p-2.5 rounded-xl text-white/60 hover:text-amber-400 
                      hover:bg-amber-500/10 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && handleDateClick(date)}
                      disabled={date ? isPastDate(date) : true}
                      className={`
                        p-2 rounded-xl font-medium text-sm transition-all duration-300
                        ${!date ? 'invisible' : ''}
                        ${date && isPastDate(date) ? 'text-white/20 cursor-not-allowed' : ''}
                        ${date && !isPastDate(date) && !isSelected(date) ? 
                          'text-white hover:bg-amber-500/10 hover:text-amber-400' : ''}
                        ${date && isSelected(date) ? 
                          'bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 shadow-lg shadow-amber-500/20' : ''}
                        ${date && isToday(date) && !isSelected(date) ? 
                          'border border-amber-500/30' : ''}
                      `}
                    >
                      {date ? date.getDate() : ''}
                    </button>
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