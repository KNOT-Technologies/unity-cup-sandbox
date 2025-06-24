import { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from '../components/tickets/DatePicker';
import ShowTimeSelector from '../components/tickets/ShowTimeSelector';
import SeatMap from '../components/tickets/SeatMap';
import TicketSummary from '../components/tickets/TicketSummary';
import UserTypeToggle from '../components/tickets/UserTypeToggle';
import type { UserType, Seat, TicketType, SelectedSeat } from '../types/tickets';
import { PRICING } from '../types/tickets';

const Tickets = () => {
  const [userType, setUserType] = useState<UserType>('tourist');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  const handleSeatSelect = (seat: Seat, ticketType: TicketType) => {
    const price = PRICING[userType][seat.zone][ticketType];
    setSelectedSeats((prev) => [
      ...prev,
      {
        ...seat,
        ticketType,
        price
      }
    ]);
  };

  const handleSeatRemove = (seatId: string) => {
    setSelectedSeats((prev) => prev.filter((seat) => seat.id !== seatId));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif font-semibold mb-4">
            Book Your Tickets
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the magic of the Pyramids Sound and Light Show.
            Choose your preferred date, time, and seats for an unforgettable evening.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Options */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Type Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <UserTypeToggle
                userType={userType}
                onUserTypeChange={setUserType}
              />
            </motion.div>

            {/* Date Picker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            >
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </motion.div>

            {/* Show Time Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            >
              <ShowTimeSelector
                showTimes={[]}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            </motion.div>

            {/* Seat Map */}
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
              >
                <SeatMap
                  selectedDate={selectedDate}
                  selectedShowTime={selectedTime}
                  onSeatSelect={handleSeatSelect}
                  userType={userType}
                />
              </motion.div>
            )}
          </div>

          {/* Right Column - Ticket Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <TicketSummary
              selectedSeats={selectedSeats}
              userType={userType}
              onRemoveSeat={handleSeatRemove}
              className="h-full"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Tickets; 