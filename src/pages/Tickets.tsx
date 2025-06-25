import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/tickets/DatePicker';
import ShowTimeSelector from '../components/tickets/ShowTimeSelector';
import SeatMap from '../components/tickets/SeatMap';
import TicketSummary from '../components/tickets/TicketSummary';
import UserTypeToggle from '../components/tickets/UserTypeToggle';
import TranslationSelector from '../components/tickets/TranslationSelector';
import type { UserType, Seat, TicketType, SelectedSeat } from '../types/tickets';
import { PRICING } from '../types/tickets';

interface TranslationPreference {
  needed: boolean;
  language?: string;
}

const Tickets = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>('tourist');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [translationPreference, setTranslationPreference] = useState<TranslationPreference>({
    needed: false
  });

  const handleSeatSelect = (seat: Seat, ticketType: TicketType) => {
    const price = PRICING[userType][seat.zone][ticketType];
    const newSelectedSeats = [
      ...selectedSeats,
      {
        ...seat,
        ticketType,
        price
      }
    ];
    setSelectedSeats(newSelectedSeats);
  };

  const handleSeatRemove = (seatId: string) => {
    setSelectedSeats((prev) => prev.filter((seat) => seat.id !== seatId));
  };

  const handleTranslationChange = (needed: boolean, language?: string) => {
    setTranslationPreference({ needed, language });
  };

  const handleProceedToCheckout = () => {
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    localStorage.setItem('userType', userType);
    localStorage.setItem('translationPreference', JSON.stringify(translationPreference));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            <UserTypeToggle userType={userType} onUserTypeChange={setUserType} />
            <DatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate} />
            <ShowTimeSelector 
              selectedTime={selectedTime} 
              onTimeSelect={setSelectedTime}
              showTimes={[]}
            />
            
            <TranslationSelector
              onTranslationChange={handleTranslationChange}
            />
            
            {selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SeatMap
                  userType={userType}
                  onSeatSelect={handleSeatSelect}
                  onSeatDeselect={handleSeatRemove}
                  selectedSeatIds={selectedSeats.map(seat => seat.id)}
                  selectedDate={selectedDate}
                  selectedShowTime={selectedTime}
                />
              </motion.div>
            )}
          </div>

          <div className="relative lg:h-[calc(100vh-8rem)]">
            <div className="sticky top-32">
              <TicketSummary
                selectedSeats={selectedSeats}
                userType={userType}
                onRemoveSeat={handleSeatRemove}
                className="max-h-[calc(100vh-10rem)] overflow-y-auto"
                onProceedToCheckout={handleProceedToCheckout}
                translationPreference={translationPreference}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets; 