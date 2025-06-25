import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, QrCode, Clock, Shield, ArrowLeft, Users, Ticket, Plus } from 'lucide-react';
import type { SelectedSeat, UserType } from '../types/tickets';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface TranslationPreference {
  needed: boolean;
  language?: string;
}

interface GuestInfo {
  id: string;
  name: string;
  nationality: string;
}

// Comprehensive list of countries
const nationalities = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'East Timor',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Korea, North',
  'Korea, South',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe'
].sort();

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit-card',
    name: 'Credit Card',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    description: 'Pay securely with your credit card'
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.0444 6.3773c-.9048-1.1488-2.3813-1.2897-2.8987-1.2897-1.2336 0-2.4362.7371-3.0918 1.2336-.5607.4508-.8738.8427-.8738.8427s-.2821-.3719-.7989-.7678c-.5297-.3719-1.5157-.9358-2.7578-.9358-2.1025 0-4.0586 1.7048-4.0586 4.5894 0 2.0235.7678 4.1375 1.7048 5.6222.9358 1.4678 2.0235 3.1088 3.5286 3.1088 1.3126 0 1.8423-.8738 3.4187-.8738 1.5157 0 1.9842.8738 3.3708.8738 1.5157 0 2.7268-1.8423 3.6624-3.3088.6086-.9358 1.0457-1.9213 1.3126-2.5299-3.4187-1.2897-3.9794-6.1519-.5183-7.5687z"/><path d="M14.4297 3.0185c.8427-1.0767 1.4678-2.5918 1.3126-4.1375-1.4678.0629-3.1718 1.0148-4.1375 2.2176-.8738 1.0457-1.6419 2.5918-1.4368 4.0746 1.5767.0629 3.2347-.8738 4.2617-2.1547z"/></svg>`,
    description: 'Quick and secure checkout with Apple Pay'
  }
];

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [userType, setUserType] = useState<UserType>('tourist');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit-card');
  const [email, setEmail] = useState('');
  const [guestInfo, setGuestInfo] = useState<GuestInfo[]>([]);
  const [translationPreference, setTranslationPreference] = useState<TranslationPreference>({
    needed: false
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    // Get selected seats from localStorage
    const storedSeats = localStorage.getItem('selectedSeats');
    if (storedSeats) {
      const seats = JSON.parse(storedSeats) as SelectedSeat[];
      setSelectedSeats(seats);
      // Initialize guest info array based on number of seats
      setGuestInfo(seats.map((seat: SelectedSeat) => ({
        id: seat.id,
        name: '',
        nationality: ''
      })));
    } else {
      // Redirect back to tickets page if no seats are selected
      navigate('/tickets');
    }
  }, [navigate]);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType') as UserType;
    const storedTranslation = localStorage.getItem('translationPreference');
    
    if (storedUserType) {
      setUserType(storedUserType);
      if (storedTranslation) {
        setTranslationPreference(JSON.parse(storedTranslation));
      }
    }
  }, []);

  const handleGuestInfoChange = (id: string, field: 'name' | 'nationality', value: string) => {
    setGuestInfo(prev => prev.map(guest => 
      guest.id === id ? { ...guest, [field]: value } : guest
    ));
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Check email
    if (!email.trim()) {
      errors.push("Please enter your email address");
    } else if (!email.includes('@')) {
      errors.push("Please enter a valid email address");
    }

    // Check guest information
    guestInfo.forEach((guest, index) => {
      if (!guest.name.trim()) {
        errors.push(`Please enter the name for Guest ${index + 1}`);
      }
      if (!guest.nationality.trim()) {
        errors.push(`Please select the nationality for Guest ${index + 1}`);
      }
    });

    // Check payment method
    if (!selectedPaymentMethod) {
      errors.push("Please select a payment method");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors([]);

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to the top where errors are displayed
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      // Store all necessary data for success page
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
      localStorage.setItem('userType', userType);
      localStorage.setItem('purchaseEmail', email);
      if (translationPreference.needed) {
        localStorage.setItem('translationPreference', JSON.stringify(translationPreference));
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page using React Router
      navigate('/success');
    } catch (error) {
      setValidationErrors(['An error occurred during checkout. Please try again.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLoading(false);
    }
  };

  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const currency = userType === 'tourist' ? '$' : 'EGP';
  const translationFee = translationPreference.needed ? (userType === 'tourist' ? 10 : 150) : 0;
  const subtotal = total + (translationFee * selectedSeats.length);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <h3 className="text-red-400 font-medium mb-2">Please fix the following:</h3>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-red-300 text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-white/60 hover:text-amber-400 
            transition-colors duration-300 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Seat Selection</span>
        </motion.button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 
              hover:border-amber-500/20 transition-all duration-500 
              hover:shadow-2xl hover:shadow-amber-500/5
              relative before:absolute before:inset-0 
              before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
              before:rounded-2xl before:opacity-0 hover:before:opacity-100 
              before:transition-opacity before:duration-500 before:pointer-events-none
              p-6">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                      backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                      <CreditCard className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <h1 className="text-xl font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                    Checkout
                  </h1>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                        backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                        <Users className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <h2 className="text-lg font-medium text-white/90">Contact Information</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Primary Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                        Primary Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl px-4 py-3
                          text-white placeholder-white/40 focus:outline-none focus:ring-2 
                          focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                        placeholder="your@email.com"
                        required
                      />
                      <p className="text-sm text-white/40 mt-2">
                        Your tickets will be sent to this email address
                      </p>
                    </div>

                    {/* Guest Information */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white/90">Guest Information</h3>
                        <span className="text-sm text-white/40">
                          {guestInfo.length} {guestInfo.length === 1 ? 'ticket' : 'tickets'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {guestInfo.map((guest, index) => {
                          const seat = selectedSeats.find(seat => seat.id === guest.id);
                          return (
                            <div key={guest.id} className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-4
                              hover:border-amber-500/20 transition-all duration-300">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-white/90 text-sm">
                                    Ticket {index + 1}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                    ${seat?.zone === 'vip' 
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-blue-400/20 text-blue-400'
                                    }`}
                                  >
                                    {seat?.zone.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-white/40 text-sm">
                                  Row {seat?.row}, Seat {seat?.number}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor={`guest-name-${guest.id}`} className="block text-xs font-medium text-white/60 mb-1">
                                    Full Name
                                  </label>
                                  <input
                                    type="text"
                                    id={`guest-name-${guest.id}`}
                                    value={guest.name}
                                    onChange={(e) => handleGuestInfoChange(guest.id, 'name', e.target.value)}
                                    placeholder="Guest full name"
                                    className="w-full bg-gray-800/30 border border-gray-700/30 rounded-lg px-3 py-2
                                      text-white placeholder-white/40 focus:outline-none focus:ring-2 
                                      focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300
                                      text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`guest-nationality-${guest.id}`} className="block text-xs font-medium text-white/60 mb-1">
                                    Nationality
                                  </label>
                                  <select
                                    id={`guest-nationality-${guest.id}`}
                                    value={guest.nationality}
                                    onChange={(e) => handleGuestInfoChange(guest.id, 'nationality', e.target.value)}
                                    className="w-full bg-gray-800/30 border border-gray-700/30 rounded-lg px-3 py-2
                                      text-white focus:outline-none focus:ring-2 
                                      focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300
                                      text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDcuNEwwIDEuNEwxLjQgMEw2IDQuNkwxMC42IDBMMTI7IDEuNEw2IDcuNFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNCIvPgo8L3N2Zz4K')]
                                      bg-no-repeat bg-[center_right_1rem]"
                                    required
                                  >
                                    <option value="" disabled>Select nationality</option>
                                    {nationalities.map(nationality => (
                                      <option key={nationality} value={nationality}>
                                        {nationality}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                        backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                        <CreditCard className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <h2 className="text-lg font-medium text-white/90">Payment Method</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`relative flex items-center p-4 cursor-pointer
                          bg-gray-800/30 border rounded-xl transition-all duration-300
                          ${selectedPaymentMethod === method.id
                            ? 'border-amber-500/50 bg-amber-500/5'
                            : 'border-gray-700/30 hover:border-amber-500/20'
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="hidden"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex-shrink-0">
                            <div 
                              className={`w-6 h-6 flex items-center justify-center rounded-lg
                                ${selectedPaymentMethod === method.id
                                  ? 'text-amber-400'
                                  : 'text-white/60'
                                }`}
                              dangerouslySetInnerHTML={{ __html: method.icon }}
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white/90">{method.name}</h3>
                            <p className="text-xs text-white/60">{method.description}</p>
                          </div>
                          <div className={`ml-auto w-4 h-4 rounded-full border-2 transition-colors duration-300
                            ${selectedPaymentMethod === method.id
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-gray-600'
                            }`}
                          >
                            {selectedPaymentMethod === method.id && (
                              <div className="w-full h-full rounded-full bg-white transform scale-[0.4]" />
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                {selectedPaymentMethod === 'credit-card' && (
                  <div className="space-y-4 mb-8">
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-white/60 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="card-number"
                        className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl px-4 py-3
                          text-white placeholder-white/40 focus:outline-none focus:ring-2 
                          focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-white/60 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl px-4 py-3
                            text-white placeholder-white/40 focus:outline-none focus:ring-2 
                            focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-white/60 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl px-4 py-3
                            text-white placeholder-white/40 focus:outline-none focus:ring-2 
                            focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-center space-x-3 text-sm text-white/60 mb-8">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>Your payment information is encrypted and secure</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300
                    relative overflow-hidden group
                    ${loading 
                      ? 'bg-gray-800/50 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 hover:shadow-lg hover:shadow-amber-500/20'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000
                    pointer-events-none"></div>
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Complete Purchase'
                    )}
                  </div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-32 lg:h-fit"
          >
            <div className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 
              hover:border-amber-500/20 transition-all duration-500 p-6
              hover:shadow-2xl hover:shadow-amber-500/5">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                      backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                      <Ticket className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <h2 className="text-xl font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                    Order Summary
                  </h2>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-800/30 rounded-xl border border-gray-700/20 p-5 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                        backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                        <Ticket className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <h2 className="text-lg font-medium text-white/90">Order Summary</h2>
                  </div>

                  <div className="space-y-3">
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3">
                        <div className="flex items-center justify-between">
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
                      </div>
                    ))}

                    {translationPreference.needed && (
                      <>
                        <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent"></div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                                backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                                <Plus className="w-5 h-5 text-amber-400" />
                              </div>
                            </div>
                            <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                              Add-ons
                            </h3>
                          </div>

                          <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white/90">Translation Headphones</div>
                                <div className="text-sm text-white/60 mt-0.5">
                                  {translationPreference.language} (x{selectedSeats.length})
                                </div>
                              </div>
                              <span className="text-amber-400 font-medium">
                                {currency} {translationFee * selectedSeats.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent"></div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-white/60">
                      <span>Tickets Subtotal</span>
                      <span>{currency} {total}</span>
                    </div>
                    {translationPreference.needed && (
                      <div className="flex justify-between text-white/60">
                        <span>Translation Service</span>
                        <span>{currency} {translationFee * selectedSeats.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-medium pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-amber-400">{currency} {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
