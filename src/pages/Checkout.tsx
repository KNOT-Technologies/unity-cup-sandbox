import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, QrCode, Clock, Shield, ArrowLeft } from 'lucide-react';
import type { SelectedSeat, UserType } from '../types/tickets';

interface PaymentMethod {
  id: string;
  name: string;
  icon: typeof CreditCard;
  description: string;
}

interface TranslationPreference {
  needed: boolean;
  language?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit-card',
    name: 'Credit Card',
    icon: CreditCard,
    description: 'Pay securely with your credit card'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    description: 'Apple Pay, Google Pay, or other digital wallets'
  },
  {
    id: 'qr',
    name: 'QR Code',
    icon: QrCode,
    description: 'Scan QR code to pay with your phone'
  }
];

const Checkout = () => {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [userType, setUserType] = useState<UserType>('tourist');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit-card');
  const [email, setEmail] = useState('');
  const [translationPreference, setTranslationPreference] = useState<TranslationPreference>({
    needed: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedSeats = localStorage.getItem('selectedSeats');
    const storedUserType = localStorage.getItem('userType') as UserType;
    const storedTranslation = localStorage.getItem('translationPreference');
    
    if (storedSeats && storedUserType) {
      setSelectedSeats(JSON.parse(storedSeats));
      setUserType(storedUserType);
      if (storedTranslation) {
        setTranslationPreference(JSON.parse(storedTranslation));
      }
    } else {
      // Redirect back to tickets page if no seats are selected
      window.location.href = '/tickets';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Clear selected seats from storage
    localStorage.removeItem('selectedSeats');
    localStorage.removeItem('userType');
    localStorage.removeItem('translationPreference');
    // Redirect to success page or show success message
    setLoading(false);
    alert('Payment successful! Your tickets have been sent to your email.');
    window.location.href = '/';
  };

  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const currency = userType === 'tourist' ? '$' : 'EGP';
  const processingFee = total * 0.05; // 5% processing fee
  const translationFee = translationPreference.needed ? (userType === 'tourist' ? 10 : 150) : 0;
  const subtotal = total + processingFee + translationFee;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 
            transition-colors duration-300 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Seat Selection</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
              <h1 className="text-2xl font-medium mb-6">Checkout</h1>

              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3
                        text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 
                        focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="your@email.com"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Your tickets will be sent to this email address
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`w-full p-4 rounded-xl border ${
                          selectedPaymentMethod === method.id
                            ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                            : 'border-gray-700/50 text-gray-300 hover:bg-gray-800/50'
                        } transition-all duration-300 text-left group`}
                      >
                        <div className="flex items-center space-x-4">
                          <Icon className={`w-5 h-5 ${
                            selectedPaymentMethod === method.id ? 'text-yellow-400' : 'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-500">{method.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center space-x-3 text-sm text-gray-400 mb-8">
                <Shield className="w-5 h-5" />
                <span>Your payment information is encrypted and secure</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                onClick={handleSubmit}
                className={`w-full bg-yellow-400 text-gray-900 py-4 px-6 rounded-xl font-medium
                  transition-all duration-300 relative overflow-hidden group
                  ${loading ? 'cursor-not-allowed opacity-80' : 'hover:bg-yellow-500 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]'}
                  focus:outline-none focus:ring-2 focus:ring-yellow-400/60`}
              >
                <span className={`inline-flex items-center ${loading ? 'invisible' : ''}`}>
                  Complete Purchase
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </div>
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-[144px] h-fit"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
              <h2 className="text-xl font-medium mb-6">Order Summary</h2>

              {/* Selected Tickets */}
              <div className="space-y-4 mb-6">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-gray-800/50
                      bg-gray-800/30"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Row {seat.row}, Seat {seat.number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${seat.zone === 'vip' 
                            ? 'bg-yellow-400/20 text-yellow-400'
                            : 'bg-blue-400/20 text-blue-400'
                          }`}
                        >
                          {seat.zone.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1 capitalize">{seat.ticketType}</div>
                    </div>
                    <span className="text-yellow-400 font-medium">
                      {currency} {seat.price}
                    </span>
                  </div>
                ))}

                {translationPreference.needed && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
                    <div>
                      <p className="font-medium">Translation Headphones</p>
                      <p className="text-sm text-gray-400">{translationPreference.language}</p>
                    </div>
                    <p className="font-medium">{currency} {translationFee}</p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-800/50 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{currency} {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Processing Fee</span>
                  <span>{currency} {processingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-3 border-t border-gray-800/50">
                  <span>Total</span>
                  <span className="text-yellow-400">
                    {currency} {(subtotal + processingFee).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>Tickets will be delivered instantly via email</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
