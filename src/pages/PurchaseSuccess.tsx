import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, Headphones, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SelectedSeat, UserType } from '../types/tickets';

interface OrderDetails {
  seats: SelectedSeat[];
  userType: UserType;
  translationPreference?: {
    needed: boolean;
    language?: string;
  };
  email: string;
}

const PurchaseSuccess = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Retrieve order details from localStorage
    const storedSeats = localStorage.getItem('selectedSeats');
    const storedUserType = localStorage.getItem('userType') as UserType;
    const storedTranslation = localStorage.getItem('translationPreference');
    const storedEmail = localStorage.getItem('purchaseEmail');

    if (storedSeats && storedUserType && storedEmail) {
      setOrderDetails({
        seats: JSON.parse(storedSeats),
        userType: storedUserType,
        translationPreference: storedTranslation ? JSON.parse(storedTranslation) : undefined,
        email: storedEmail
      });

      // Clear storage after retrieving
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('userType');
      localStorage.removeItem('translationPreference');
      localStorage.removeItem('purchaseEmail');
    } else {
      // If no order details found, redirect to home
      navigate('/', { replace: true });
    }
  }, [navigate]);

  if (!orderDetails) {
    return null;
  }

  const currency = orderDetails.userType === 'tourist' ? '$' : 'EGP';
  const total = orderDetails.seats.reduce((sum, seat) => sum + seat.price, 0);
  const translationFee = orderDetails.translationPreference?.needed 
    ? (orderDetails.userType === 'tourist' ? 10 : 150) 
    : 0;
  const totalWithAddons = total + (translationFee * orderDetails.seats.length);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/20 backdrop-blur-xl rounded-xl border border-gray-700/20 
            hover:border-amber-500/20 transition-all duration-500 
            hover:shadow-2xl hover:shadow-amber-500/5
            relative before:absolute before:inset-0 
            before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
            before:rounded-xl before:opacity-0 hover:before:opacity-100 
            before:transition-opacity before:duration-500"
        >
          <div className="p-8 relative">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-block relative mb-4">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-full p-4 relative
                  backdrop-blur-xl border border-amber-500/20">
                  <CheckCircle className="w-12 h-12 text-amber-400" />
                </div>
              </div>
              <h1 className="text-2xl font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent mb-2">
                Purchase Successful!
              </h1>
              <p className="text-white/60">
                Your tickets have been sent to {orderDetails.email}
              </p>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Show Details */}
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                      backdrop-blur-xl border border-amber-500/20">
                      <Calendar className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white/90">Show Details</h2>
                    <p className="text-sm text-white/60">Sound and Light Show at the Pyramids</p>
                  </div>
                </div>

                <div className="pl-12 space-y-3">
                  {orderDetails.seats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${seat.zone === 'vip' 
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-400/20 text-blue-400'
                            }`}
                          >
                            {seat.zone.toUpperCase()}
                          </span>
                          <span className="text-white/90">
                            Row {seat.row}, Seat {seat.number}
                          </span>
                        </div>
                        <div className="text-sm text-white/60 mt-0.5">
                          {seat.ticketType === 'senior' ? 'Senior' : 
                           seat.ticketType === 'student' ? 'Student' : 'Child'} Ticket
                        </div>
                      </div>
                      <span className="text-amber-400 font-medium">
                        {currency} {seat.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              {orderDetails.translationPreference?.needed && (
                <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                        backdrop-blur-xl border border-amber-500/20">
                        <Headphones className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-white/90">Add-ons</h2>
                      <p className="text-sm text-white/60">Additional services for your experience</p>
                    </div>
                  </div>

                  <div className="pl-12">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/90">Translation Headphones</div>
                        <div className="text-sm text-white/60 mt-0.5">
                          {orderDetails.translationPreference.language} (x{orderDetails.seats.length})
                        </div>
                      </div>
                      <span className="text-amber-400 font-medium">
                        {currency} {translationFee * orderDetails.seats.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Tickets Subtotal</span>
                    <span>{currency} {total}</span>
                  </div>
                  {orderDetails.translationPreference?.needed && (
                    <div className="flex justify-between text-white/60">
                      <span>Translation Service</span>
                      <span>{currency} {translationFee * orderDetails.seats.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-medium pt-2">
                    <span className="text-white">Total Paid</span>
                    <span className="text-amber-400">{currency} {totalWithAddons}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 py-2 px-4 text-white/60 hover:text-white
                  transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PurchaseSuccess; 